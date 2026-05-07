#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import gzip
import random
import csv
from PIL import Image, ImageDraw, ImageFont
from IPython.display import Image as IPImage, display

# Define the path to the font file
font_location = 'NotoSansMongolian-Regular.ttf'

# Check if the font file is available
if not os.path.isfile(font_location):
    raise FileNotFoundError("The specified font file was not found.")

# Define a range of font sizes
font_size_options = [29, 30, 31, 32]

# Define punctuation variations
punctuation_marks = ['᠀', '᠀᠋', '᠀᠌', '᠀᠍'] + ['᠁', '᠂', '᠃', '᠄', '᠅'] * 20

# Function to read lyrics from a compressed file
def fetch_lyrics(file_path='', max_length=10):
    lyrics_list = []
    with gzip.open(file_path, 'rt', encoding='utf-8') as file:
        for line in file:
            _, mongolian_text = line.strip().split('|')
            if len(mongolian_text.split()) <= max_length:
                lyrics_list.append(mongolian_text)
    return lyrics_list

# Function to create an image from text
def create_text_image(lyric, file_name):
    chosen_font_size = random.choice(font_size_options)
    try:
        # Load the selected font
        selected_font = ImageFont.truetype(font_location, chosen_font_size)

        # Determine text dimensions with the selected font
        temp_image = Image.new('RGB', (1, 1), 'white')
        temp_draw = ImageDraw.Draw(temp_image)
        text_width, text_height = temp_draw.textsize(lyric, font=selected_font)

        # Initialize a blank canvas with extra space for rotation
        canvas_width = text_width + 200  # Add some padding
        canvas_height = text_height * 2  # Ensure there is enough height for rotation
        canvas = Image.new('RGB', (canvas_width, canvas_height), 'white')
        pen = ImageDraw.Draw(canvas)

        # Calculate text positioning
        x_position = (canvas_width - text_width) // 2
        y_position = (canvas_height - text_height) // 2

        # Write text onto the canvas
        pen.text((x_position, y_position), lyric, font=selected_font, fill='black')

        # Apply rotation and crop to the canvas
        rotated_canvas = canvas.rotate(-90, expand=True)

        # Calculate the crop area to center the text
        crop_left = max(5, (rotated_canvas.width - text_height) // 2)
        crop_upper = max(0, (rotated_canvas.height - text_width) // 2)
        crop_right = min(rotated_canvas.width - 5, crop_left + text_height)
        crop_lower = min(rotated_canvas.height, crop_upper + text_width)

        cropped_canvas = rotated_canvas.crop((crop_left, crop_upper, crop_right, crop_lower))

        # Save the final image
        cropped_canvas.save(file_name)

        # Display the image
    except Exception as error:
        print(f"An error occurred while creating the image: {error}")

# Main execution block
if __name__ == '__main__':
    # Open a CSV file for writing
    with open('output.csv', 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        # Write the header row
        csv_writer.writerow(['Image File', 'Text'])

        for index, line in enumerate(fetch_lyrics()):
            # Randomly add punctuation to the line
            if random.random() < 0.05:
                punctuation = random.choice(punctuation_marks)
                line = f"{punctuation} {line}" if random.choice([True, False]) else f"{line}{punctuation}"

            # Define the output file path
            image_file = f'imgs/line_{index}.png'
            create_text_image(line, image_file)

            # Write the image file path and text to the CSV file
            csv_writer.writerow([image_file, line])
