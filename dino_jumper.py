import sounddevice as sd
import numpy as np
import pyautogui
import time

# Configuration
threshold = 0.121   # Adjust this sensitivity threshold (0.1-1.0)
cooldown = 0.1    # Minimum time between jumps (seconds)
sample_rate = 44100  # Audio sampling rate
blocksize = 1024   # Audio block size

last_jump_time = 0

def audio_callback(indata, frames, time_info, status):
    global last_jump_time
    current_time = time.time()
                         
    # Calculate volume (root mean square)
    volume = np.sqrt(np.mean(indata**2))
    
    # Check volume against threshold and cooldown
    if volume > threshold and (current_time - last_jump_time) > cooldown:
        pyautogui.press('space')
        last_jump_time = current_time
        print(f"Jump! (Volume: {volume:.3f})")

try:
    print("Dino sound controller activated!")
    print("Make sure the Chrome dino game is focused.")
    print("Adjust the threshold in the code if needed (current:", threshold, ")")         
    # Start audio stream
    with sd.InputStream(callback=audio_callback,
                       blocksize=blocksize,
                       samplerate=sample_rate):
        while True:
            time.sleep(0.1)
except KeyboardInterrupt:
    print("\nStopped listening")
except Exception as e:
    print("Error:", e)