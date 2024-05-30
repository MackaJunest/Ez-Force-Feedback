#include <Arduino.h>
#include <SimpleFOC.h>
#include <BleGamepad.h>
#include <BluetoothSerial.h>

MagneticSensorI2C sensor = MagneticSensorI2C(AS5600_I2C);
MagneticSensorI2C sensor1 = MagneticSensorI2C(AS5600_I2C);
TwoWire I2Cone = TwoWire(0);
TwoWire I2Ctwo = TwoWire(1);


// Motor instance
BLDCMotor motor = BLDCMotor(7);
BLDCDriver3PWM driver = BLDCDriver3PWM(32, 33, 25, 22);

BLDCMotor motor1 = BLDCMotor(7);
BLDCDriver3PWM driver1 = BLDCDriver3PWM(26, 27, 14, 12);

// commander communication instance
//Commander command = Commander(Serial);
//void doMotor(char* cmd){ command.motor(&motor1, cmd); }

// PL pin 7
int load = 16;
// CE pin 4
int clockEnablePin = 15;
// Q7 pin 5
int dataIn = 13;
// CP pin 6
int clockIn = 17;

const int numRegisters = 3; // Number of daisy-chained shift registers
const int numBits = 8;      // Number of bits in each shift register

int inputData[numRegisters*numBits]; // Array to store input data

float S_OFF[2]={-1.18,0.8};

BleGamepad FFB_HOTAS("HOTAS_FFB","mackajunest",100);
BleGamepadConfiguration FFB_HOTAS_conf;
BluetoothSerial SerialBT;

#define numOfButtons 24
#define numOfHatSwitches 0
#define enableX true
#define enableY true
#define enableZ false
#define enableRX false
#define enableRY false
#define enableRZ false
#define enableSlider1 false
#define enableSlider2 false
#define enableRudder false
#define enableThrottle false
#define enableAccelerator false
#define enableBrake false
#define enableSteering false

void HC165()
{
  // Write pulse to load pin
  digitalWrite(load, LOW);
  unsigned long previousMicros = micros(); // Record the current time
  while (micros() - previousMicros < 1); // Wait until 1 microsecond has elapsed
  digitalWrite(load, HIGH);
  previousMicros = micros(); // Update the previousMicros value
  while (micros() - previousMicros < 1); // Wait until 1 microsecond has elapsed

  // Get data from 74HC165
  digitalWrite(clockEnablePin, LOW);
  previousMicros = micros(); // Record the current time

  for (int i = 0; i < numRegisters*numBits; i++)
   {
      digitalWrite(clockIn, HIGH);
      while (micros() - previousMicros < 1); // Wait until 1 microsecond has elapsed
      previousMicros = micros(); // Update the previousMicros value
      inputData[i] = digitalRead(dataIn);
      digitalWrite(clockIn, LOW);
      while (micros() - previousMicros < 1); // Wait until 1 microsecond has elapsed
      previousMicros = micros(); // Update the previousMicros value
   }

  digitalWrite(clockEnablePin, HIGH);
}


void setup()
{
  I2Cone.begin(19, 18, 400000); 
  I2Ctwo.begin(23, 5, 400000);
  sensor.init(&I2Cone);
  sensor1.init(&I2Ctwo);
  // link the motor to the sensor
  motor.linkSensor(&sensor);
  motor1.linkSensor(&sensor1);

  // driver config
  // power supply voltage [V]
  driver.voltage_power_supply = 12;
  driver.init();

  driver1.voltage_power_supply = 12;
  driver1.init();
  // link the motor and the driver
  motor.linkDriver(&driver);
  motor1.linkDriver(&driver1);
  
    // maximal voltage to be set to the motor
  motor.current_limit = 1.25;
  motor1.current_limit = 1.25;
  motor.voltage_limit = 12.6;
  motor1.voltage_limit = 12.6;
  // set motion control loop to be used
  //motor1.torque_controller = TorqueControlType::voltage; 
  motor.torque_controller = TorqueControlType::voltage; 
  motor.controller = MotionControlType::angle;
  motor.PID_velocity.P = 0.5;
  motor.PID_velocity.I = 0.0;
  motor.PID_velocity.D = 0.0;
  motor.PID_velocity.output_ramp = 10000.0;
  motor.PID_velocity.limit = 50.0;
  // Low pass filtering time constant 
  motor.LPF_velocity.Tf = 0.03;
  // angle loop PID
  motor.P_angle.P = 30.0;
  motor.P_angle.I = 0.0;
  motor.P_angle.D = 0.0;
  motor.P_angle.output_ramp = 10000.0;
  motor.P_angle.limit = 20.0;
  // Low pass filtering time constant 
  motor.LPF_angle.Tf = 0.018;
  motor1.torque_controller = TorqueControlType::voltage; 
  motor1.controller = MotionControlType::angle;

  motor1.PID_velocity.P = 0.5;
  motor1.PID_velocity.I = 0.0;
  motor1.PID_velocity.D = 0.0;
  motor1.PID_velocity.output_ramp = 10000.0;
  motor1.PID_velocity.limit = 50.0;
  // Low pass filtering time constant 
  motor1.LPF_velocity.Tf = 0.03;
  // angle loop PID
  motor1.P_angle.P = 30.0;
  motor1.P_angle.I = 0.0;
  motor1.P_angle.D = 0.0;
  motor1.P_angle.output_ramp = 10000.0;
  motor1.P_angle.limit = 20.0;
  // Low pass filtering time constant 
  motor1.LPF_angle.Tf = 0.018;

  motor.phase_resistance = 3.8;
  motor1.phase_resistance = 3.8;

  motor.sensor_offset = S_OFF[0];
  motor1.sensor_offset = S_OFF[1];
  motor.foc_modulation = FOCModulationType::SpaceVectorPWM;
  motor.modulation_centered = 1.0;
  motor1.foc_modulation = FOCModulationType::SpaceVectorPWM;
  motor1.modulation_centered = 1.0;
  // Setup Serial Monitor
  Serial.begin(115200);
  //motor.useMonitoring(Serial);
  //Initialize the motor
  motor.sensor_direction= CCW;
  motor.zero_electric_angle=5.82;
  motor1.sensor_direction= CW;
  motor1.zero_electric_angle=0.91;
  motor.init();
  motor1.init();
  motor.initFOC();
  motor1.initFOC();
  // Setup 74HC165 connections
  pinMode(load, OUTPUT);
  pinMode(clockEnablePin, OUTPUT);
  pinMode(clockIn, OUTPUT);
  pinMode(dataIn, INPUT);
  Serial.println("Starting BLE work!");
  FFB_HOTAS_conf.setAutoReport(false);
  FFB_HOTAS_conf.setControllerType(CONTROLLER_TYPE_GAMEPAD); // CONTROLLER_TYPE_JOYSTICK, CONTROLLER_TYPE_GAMEPAD (DEFAULT), CONTROLLER_TYPE_MULTI_AXIS
  FFB_HOTAS_conf.setButtonCount(numOfButtons);
  FFB_HOTAS_conf.setHatSwitchCount(numOfHatSwitches);
  FFB_HOTAS_conf.setWhichAxes(enableX, enableY, enableZ, enableRX, enableRY, enableRZ, enableSlider1, enableSlider2);
  FFB_HOTAS_conf.setAxesMin(0);
  FFB_HOTAS_conf.setAxesMax(255);
  SerialBT.begin();   // Begin the BT Classic serial port
  FFB_HOTAS.begin(&FFB_HOTAS_conf); // Simulation controls, special buttons and hats 2/3/4 are disabled by default
  Serial.println("Starting BLE work!");
  Serial.println("Joystick ready.");

  _delay(1000);
}

// angle set point variable
float target_angle[2]={0.0,0.0};
// timestamp
unsigned long timestamp_us = millis();
bool Switch= true;

void Vibration(int axis, int Freq, float intensity)
{
  if (millis() - timestamp_us > 500 / Freq)
  {
    timestamp_us = millis();
    if (Switch)
    {
      if (axis == 0)
      {
        target_angle[axis] = sensor.getAngle() - S_OFF[axis] + (intensity / 50);
        Switch = !Switch;
      }
      else
      {
        target_angle[axis] = sensor1.getAngle() - S_OFF[axis] + (intensity / 50);
        Switch = !Switch;
      }
    }
    else
    {
      if (axis == 0)
      {
        target_angle[axis] = sensor.getAngle() - S_OFF[axis] - (intensity / 50);
        Switch = !Switch;
      }
      else
      {
        target_angle[axis] = sensor1.getAngle() - S_OFF[axis] - (intensity / 50);
        Switch = !Switch;
      }
    }
  }
}

void processCommand() 
{
  int axis,frequency,intensity;
  if (SerialBT.available()) 
  { // Check if there's data available to read
    String command = SerialBT.readStringUntil('\n'); // Read the command until newline character
    
    if (command.charAt(0) == 'X') 
    {
      axis=1;
      frequency = command.substring(1).toInt(); // Parse the rest of the string as an integer
      
      // Extract the intensity (last two characters of the string)
      intensity = command.substring(command.length() - 2).toInt();
      
      // Process the command (e.g., call Vibration function) with axis, frequency, and intensity
      Vibration(axis, frequency, intensity);
    }
    else if (command.charAt(0) == 'Y')
    {
      axis=0;
      frequency = command.substring(1).toInt(); // Parse the rest of the string as an integer
      
      // Extract the intensity (last two characters of the string)
      intensity = command.substring(command.length() - 2).toInt();
      
      // Process the command (e.g., call Vibration function) with axis, frequency, and intensity
      Vibration(axis, frequency, intensity);
    }
  }
}

void Set_Angle(int axis, float degrees)
{
  target_angle[axis]=degrees/180*PI;
}

void loop()
{
  while (FFB_HOTAS.isConnected())
  {
    motor.loopFOC();
    motor1.loopFOC();
    processCommand();
    motor.move(target_angle[0]);
    motor1.move(target_angle[1]);
    HC165();
    double Y_val= (sensor1.getPreciseAngle()-S_OFF[1])*100;
    double X_val= (sensor.getPreciseAngle()-S_OFF[0])*100;
    Serial.print(Y_val);
    Serial.println(X_val);
    constrain(X_val,200,275);
    constrain(Y_val,-37,37);
    FFB_HOTAS.setX(map(X_val,200,275,0,255));
    FFB_HOTAS.setY(map(Y_val,-37,37,0,255));
    for (int i = 0; i < numRegisters*numBits; i++)
    {
      if (inputData[i]==1)
      {
        FFB_HOTAS.press(i+1);
      }
      else
      {
        FFB_HOTAS.release(i+1);         
      }
      FFB_HOTAS.sendReport();
    }
  }
}

