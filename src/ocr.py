import os
import sys
import gzip
import random
import numpy as np
import cv2
import torch
import torch.nn as neural_net
import argparse
import statistics
import matplotlib.pylab as plot_lib
from os.path import exists, join, basename, splitext, abspath
plot_lib.rcParams["axes.grid"] = False

class BiLSTM(neural_net.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(BiLSTM, self).__init__()
        self.rnn = neural_net.LSTM(input_size, hidden_size, bidirectional=True)
        self.embedding = neural_net.Linear(hidden_size * 2, output_size)

    def forward(self, input_seq):
        lstm_out, _ = self.rnn(input_seq)
        seq_len, batch, hidden = lstm_out.size()
        lstm_out_flat = lstm_out.view(seq_len * batch, hidden)
        result = self.embedding(lstm_out_flat)
        result = result.view(seq_len, batch, -1)
        return result

class MongolianCRNN(neural_net.Module):
    def __init__(self, image_height, num_channels, num_classes, hidden_size):
        super(MongolianCRNN, self).__init__()
        assert image_height % 16 == 0, 'image_height must be a multiple of 16'

        kernel_sizes = [3, 3, 3, 3, 3, 3, 2]
        paddings = [1, 1, 1, 1, 1, 1, 0]
        strides = [1, 1, 1, 1, 1, 1, 1]
        num_filters = [64, 128, 256, 256, 512, 512, 512]

        conv_layers = neural_net.Sequential()
        def conv_block(index, apply_batchnorm=False):
            in_channels = num_channels if index == 0 else num_filters[index-1]
            out_channels = num_filters[index]
            conv_layers.add_module(f'conv{index}', neural_net.Conv2d(in_channels, out_channels, kernel_sizes[index], strides[index], paddings[index]))
            if apply_batchnorm:
                conv_layers.add_module(f'batchnorm{index}', neural_net.BatchNorm2d(out_channels))
            conv_layers.add_module(f'relu{index}', neural_net.ReLU(True))

        conv_block(0)
        conv_layers.add_module('pooling0', neural_net.MaxPool2d(2, 2))
        conv_block(1)
        conv_layers.add_module('pooling1', neural_net.MaxPool2d(2, 2))
        conv_block(2, True)
        conv_block(3)
        conv_layers.add_module('pooling2', neural_net.MaxPool2d((2, 2), (2, 1), (0, 1)))
        conv_block(4, True)
        conv_block(5)
        conv_layers.add_module('pooling3', neural_net.MaxPool2d((2, 2), (2, 1), (0, 1)))
        conv_block(6, True)

        self.cnn = conv_layers
        self.rnn = neural_net.Sequential(
            BiLSTM(512, hidden_size, hidden_size),
            BiLSTM(hidden_size, hidden_size, num_classes))

    def forward(self, input_tensor):
        conv_output = self.cnn(input_tensor)
        batch_size, channels, height, width = conv_output.size()
        assert height == 1, "Height after conv layers must be 1."
        conv_output_flat = conv_output.squeeze(2)
        conv_output_flat = conv_output_flat.permute(2, 0, 1)

        lstm_output = self.rnn(conv_output_flat)
        return lstm_output
# Result container
results_list = []

# Define the line height for OCR
ocr_line_height = 32

# Mongolian script character set
mongolian_alphabet = list(range(0x1800, 0x180F)) + list(range(0x1810, 0x181A)) + list(range(0x1820, 0x1879)) + list(range(0x1880, 0x18AB)) + [0x202F]
mongolian_alphabet = "B "+ "".join([chr(char) for char in mongolian_alphabet])  # B for Blank
index_to_char_map = {idx: char for idx, char in enumerate(mongolian_alphabet)}

def process_image(image_file_path):
    image_data = cv2.imread(image_file_path, cv2.IMREAD_UNCHANGED)
    if image_data is None:
        print("Image loading failed.")
        return None

    if image_data.shape[-1] == 4:
        # Process transparency
        alpha_layer = image_data[:, :, 3]
        color_layers = image_data[:, :, :3]
        background = np.ones_like(color_layers, dtype=np.uint8) * 255
        alpha_scale = alpha_layer[:, :, None] / 255.0
        image_data = color_layers * alpha_scale + background * (1 - alpha_scale)
        image_data = image_data.astype(np.uint8)

        # Convert to grayscale
        image_data = cv2.cvtColor(image_data, cv2.COLOR_BGR2GRAY)
        image_data = cv2.GaussianBlur(image_data, (5, 5), 0)

        # Apply thresholding
        _, image_data = cv2.threshold(image_data, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Invert image if needed
        white_pixel_ratio = (np.sum(image_data == 255) / image_data.size) * 100
        if white_pixel_ratio < 50:
            image_data = cv2.bitwise_not(image_data)
    else:
        image_data = cv2.cvtColor(image_data, cv2.COLOR_BGR2GRAY)

    return image_data

def adjust_image_size(image, target_width=None, target_height=None, interpolation_method=cv2.INTER_LINEAR):

    # Determine the scale ratio based on the target width or height while maintaining aspect ratio
    (current_height, current_width) = image.shape[:2]

    if target_width is not None:
        scale_ratio = target_width / float(current_width)
        dim = (target_width, int(current_height * scale_ratio))
    elif target_height is not None:
        scale_ratio = target_height / float(current_height)
        dim = (int(current_width * scale_ratio), target_height)
    else:
        raise ValueError("Either target width or target height must be provided.")

    # Resize the image to the new dimensions
    resized_image = cv2.resize(image, dim, interpolation=interpolation_method)
    return resized_image

def retrieve_model(checkpoint_path, gpu_enabled=False):
    print("Retrieving model from checkpoint...")
    ocr_model = MongolianCRNN(ocr_line_height, 1, len(mongolian_alphabet), 256)
    model_checkpoint = torch.load(checkpoint_path, map_location='cpu' if not gpu_enabled else None)
    ocr_model.load_state_dict(model_checkpoint['state_dict'])
    ocr_model.float()
    ocr_model.eval()
    ocr_model = ocr_model.cuda() if gpu_enabled else ocr_model.cpu()
    return ocr_model

def extract_text_lines(original_image, dilate_width=3, dilate_height=30, aspect_ratio_threshold=0.25, median_width_limit=0.7):
    text_lines = []
    if original_image is None:
        print("No image available for text line extraction.")
        return text_lines

    image_copy = original_image
    if image_copy.mean() < 100:
        image_copy = (255 - image_copy)

    # Threshold and dilate the image
    _, thresholded_image = cv2.threshold(image_copy, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    dilation_kernel = np.ones((dilate_height, dilate_width), np.uint8)
    dilated_image = cv2.dilate(thresholded_image, dilation_kernel, iterations=1)

    # Find contours
    contours_info = cv2.findContours(dilated_image.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = contours_info[0] if len(contours_info) == 2 else contours_info[1]
    contours = sorted(contours, key=lambda ctr: cv2.boundingRect(ctr)[0])

    image_with_contours = original_image.copy()
    cv2.drawContours(image_with_contours, contours, -1, (0,255,0), 3)

    preprocessed_overlay = original_image.copy()
    for contour in contours:
        x, y, width, height = cv2.boundingRect(contour)
        if aspect_ratio_threshold * height >= width and (median_width_limit * width <= height <= median_width_limit * width):
            cv2.rectangle(preprocessed_overlay, (x, y), (x + width, y + height), (255, 0, 0), 2)

    contour_widths = [cv2.boundingRect(ctr)[2] for ctr in contours if cv2.boundingRect(ctr)[3]/cv2.boundingRect(ctr)[2] >= aspect_ratio_threshold]
    if contour_widths:
        median_contour_width = statistics.median(contour_widths)
        for contour in contours:
            x, y, width, height = cv2.boundingRect(contour)
            if aspect_ratio_threshold * height >= width and (median_contour_width * (1 - median_width_limit) <= width <= median_contour_width * (1 + median_width_limit)):
                text_lines.append([(x, y), (x+width, y+height)])
    else:
        print("No suitable contours found, check the preprocessing or parameters.")

    return text_lines

def execute_ocr(image_data, text_lines, model_checkpoint_path, gpu_enabled=False):
    print("Performing OCR...")
    ocr_model = retrieve_model(model_checkpoint_path, gpu_enabled)
    torch.set_grad_enabled(False)

    ocr_results = []
    for line in text_lines:
        (start_x, start_y), (end_x, end_y) = line
        line_image = adjust_image_size(np.array(np.rot90(image_data[start_y:end_y, start_x:end_x])), target_height=ocr_line_height)

        ocr_input = torch.from_numpy(line_image / 255).float().unsqueeze(0).unsqueeze(0)
        ocr_output = ocr_model(ocr_input)
        predictions = ocr_output.softmax(2).max(2)[1]

        def convert_to_text(tensor_sequence, max_length=None, skip_repeats=False):
            text_output = ''
            sequence_array = tensor_sequence.cpu().detach().numpy()
            for i in range(len(sequence_array)):
                if max_length is not None and i >= max_length:
                    continue
                character = index_to_char_map[sequence_array[i]]
                if character != 'B':  # Skip blank
                    if skip_repeats and i != 0 and character == index_to_char_map[sequence_array[i - 1]]:
                        continue
                    else:
                        text_output += character
            return text_output

        text_line = convert_to_text(predictions[:, 0], skip_repeats=True)
        ocr_results.append((line_image, text_line))

    return ocr_results

def main(image_path):
    # Load image
    loaded_img = process_image(image_path)
    if loaded_img is None:
        print("Image could not be loaded.")
        return

    # Perform line segmentation
    detected_lines = extract_text_lines(loaded_img)
    print(f"Number of lines detected: {len(detected_lines)}.")

    # Execute OCR on the segmented lines
    ocr_results = execute_ocr(loaded_img, detected_lines, 'src/epoch.pth')

    # Display OCR results
    for _, recognized_text in ocr_results:
        print("Recognized Text:", recognized_text)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='OCR script')
    parser.add_argument('image_path', type=str, help='Path to the input image')
    args = parser.parse_args()

    main(args.image_path)
