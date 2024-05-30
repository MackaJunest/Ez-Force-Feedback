# Force Feedback Joystick
A DIY low-cost Force Feedback Joystick for an immersive gaming experience

## Overview
This project aims to build a Force Feedback Joystick that provides realistic haptic feedback to enhance the gaming experience. The joystick uses a combination of a magnet encoder, two BLDC motors, and an ESP32 to simulate physical forces encountered in virtual environments.

## Interative Image(Click the image to move)
[![Interactive Image](https://github.com/MackaJunest/Ez-Force-Feedback/assets/95353708/2badf889-2a61-4303-9135-81babefee2fa)](https://mackajunest.github.io/Ez-Force-Feedback/)

## Features

### Hardware:
- **Microcontroller**: ESP32 for control and communication.
- **Force Feedback**: Dual motor system with FOC control for haptic feedback.
- **Sensors**: AS5600 magnet sensor for 12-bit precise position tracking.
- **Communication**: Utilizes the onboard Bluetooth of ESP32.
- **Power Supply**: External 12V10A power supply for motors.
- **Enclosure**: Custom 3D-printed housing for all components.
- **Stick Connection**: Quick-switching electrical connection plug for HOTAS Stick.
  **HOTAS Stick**: The joystick I'm using is a remix version of [Open Viper HOTAS v0.2](https://www.thingiverse.com/thing:4924037) by [Bacon8tor](https://www.thingiverse.com/bacon8tor/designs) on www.thingiverse.com, I have modified the connector of the stick in order to fit my joystick base.

### Software:
- **Programming**: PlatformIO with the Arduino framework.
- **Haptic Effects**: Pre-programmed haptic effects for various games.
- **Configurable Settings**: Adjustable force feedback intensity and button mapping.

## Roadmap

### Main Objectives
- [x] Design and print the joystick enclosure.
- [x] Implement basic joystick functionality (position tracking, button inputs).
- [x] Integrate dual motor force feedback system.
- [x] Develop haptic feedback effects.
- [x] Implement Bluetooth communication.
- [x] Quick-switch plug for HOTAS stick.

### Extended Objectives
- [ ] Develop different haptic feedback effects for different situations.

## License
This project is licensed under the GPL 3.0 License, allowing for unrestricted use, modification, and distribution. See the [LICENSE](LICENSE) file for details.

## Disclaimer
Use the Force Feedback Joystick at your own risk. The developers are not liable for any damage or injury caused by its use.
