
#include "MPU6050.hpp"
#include "ApproMath.hpp"
#include "Orientation_Fusion.hpp"
#include "MPU6050_DMP6/MPU6050_6Axis_MotionAppsT.h"

MPU6050 mpu;
bool dmpReady = false;  // set true if DMP init was successful
uint8_t packetSize;
void driveMotor(int pin,int16_t T)
{
  if(T<0)T=0;
  digitalWrite(pin, HIGH);   // turn the LED on (HIGH is the voltage level)
  delay(1);
  delayMicroseconds(T);
  digitalWrite(pin, LOW);    // turn the LED off by making the voltage LOW
}
void driveMotorS(int pin,int16_t T)
{
  if(T<0)T=0;
  if(T>700)T=700;
  digitalWrite(pin, HIGH);   // turn the LED on (HIGH is the voltage level)
  delay(1);
  delayMicroseconds(T);
  digitalWrite(pin, LOW);    // turn the LED off by making the voltage LOW
}
// the setup function runs once when you press reset or power the board
void setup() {
  Serial.begin(115200);
  // initialize digital pin 13 as an output.
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);


  int16_t i;

  
  setup_6050();
  setup_HCSR04();
  /*for(i=0;i<7*1000/20;i++)
  {
    
    driveMotor(13,0);
    driveMotor(12,0);
    delay(19);
  }*/
  delay(5000);
  //while(1);
}

float controller(const OriFus_EulerAngle *euler_sys_Angle,const OriFus_EulerAngle *con_Angle)
{
  float e_roll = euler_sys_Angle->roll-con_Angle->roll;
  static float pre_e_Roll = e_roll;
  static float Inte_e_Roll = 0;
  Inte_e_Roll+=e_roll;
  if(Inte_e_Roll>10000)Inte_e_Roll=10000;
  else if(Inte_e_Roll<-10000)Inte_e_Roll=-10000;

  float Ts=0.01;
//1.4,3.7,0.7
//1.1,3.7,0.8
  float Pout = e_roll*1;
  float Iout = Inte_e_Roll*3.5*Ts;
  float Dout = (e_roll - pre_e_Roll)*0.7/Ts;
  pre_e_Roll=e_roll;
  return Pout+Dout+Iout;
}




#define HCSR04_MAX 500
unsigned long preLoop = 0;
void loop() {
  Quaternion q;
  int distIdx=0;
  while(1)
  {
    int tmp = read_HCSR04();
    if(tmp!=HCSR04_MAX)distIdx=tmp;
    while(1)
    {
      Quaternion *ret_q=read_6050(&q);
      if(ret_q)
      {
        break;
      }
    }
    GetNewIMUData(&q,distIdx);
  }
}

unsigned long XX=0;
// the loop function runs over and over again forever
const float RAD2DEG=180.0 / M_PI;

OriFus_EulerAngle control_Angle={25,0,0};
//volatile uint16_t dfdf[3000];
void GetNewIMUData(Quaternion *q,int distIdx)
{
      //Serial.print(1/period);Serial.print(" ");
      
      char BUF[130];
      unsigned long nowLoop= millis();

      int if_do_euler=0;
      if(if_do_euler)
      {
  
        float ypr[3];           // [yaw, pitch, roll]   yaw/pitch/roll container and gravity vector
        static float period=0;
        static long preLoop=nowLoop;
        period=(0.8*period+0.2*(nowLoop-preLoop)/1000.0);
        preLoop= nowLoop; 

        mpu.dmpGetEuler(ypr, q);
        
        OriFus_EulerAngle euler_sys_Angle={0,0,0};
      
        euler_sys_Angle.yaw  =ypr[0] * 180/M_PI;
        euler_sys_Angle.pitch=ypr[1] * 180/M_PI;
        euler_sys_Angle.roll =ypr[2] * 180/M_PI;
        //Serial.print(1/period);Serial.print(" ");
        int offset = sprintf(BUF,"[%4d.%03d, %5d, %5d,%5d,%04d],",
        (int)(nowLoop/1000),(int)(nowLoop%1000),
        (int)(euler_sys_Angle.roll*10),
        (int)(euler_sys_Angle.yaw*10),
        (int)(euler_sys_Angle.pitch*10),
        (int)distIdx);

        Serial.println(BUF);
        /*Serial.print((float)CC);Serial.print(" ");
        //Serial.print(euler_sys_Angle.pitch);Serial.print(" ");
        //Serial.print(euler_sys_Angle.roll);Serial.print(" ");
        //Serial.print(euler_sys_Angle.yaw);
        Serial.println();*/
      }
      else
      {
        
        int offset = sprintf(BUF,"[%4d.%03d, %5d, %5d,%5d, %5d,%04d],",
        (int)(nowLoop/1000),(int)(nowLoop%1000),
        (int)(q->w*1000),
        (int)(q->x*1000),
        (int)(q->y*1000),
        (int)(q->z*1000),
        (int)distIdx);

        Serial.println(BUF);
      }

}


Quaternion * read_6050(Quaternion *q_dat) {
    uint8_t fifoBuffer[64]; // FIFO storage buffer
    // if programming failed, don't try to do anything
    if (!dmpReady) return NULL;


    // reset interrupt flag and get INT_STATUS byte
    uint8_t mpuIntStatus = mpu.getIntStatus();

    // get current FIFO count
    uint16_t fifoCount = mpu.getFIFOCount();

    // check for overflow (this should never happen unless our code is too inefficient)
    if ((mpuIntStatus & 0x10) || fifoCount == 1024) {
        // reset so we can continue cleanly
        mpu.resetFIFO();
        Serial.println(F("FIFO overflow!"));

    // otherwise, check for DMP data ready interrupt (this should happen frequently)
    } else if (mpuIntStatus & 0x2){

      // wait for correct available data length, should be a VERY short wait
      while (fifoCount < packetSize) fifoCount = mpu.getFIFOCount();
      

      mpu.getFIFOBytes(fifoBuffer, packetSize);
      fifoCount -= packetSize;
      /*while(fifoCount>=packetSize){
        mpu.getFIFOBytes(fifoBuffer, packetSize);
        fifoCount -= packetSize;
      }*/

      
      //Quaternion q;           // [w, x, y, z]         quaternion container
      mpu.dmpGetQuaternion(q_dat, fifoBuffer);
      
      return q_dat;
  }
  return NULL;
}






void setup_6050() {
    // join I2C bus (I2Cdev library doesn't do this automatically)
    Wire.begin();
    Wire.setClock(400000); // 400kHz I2C clock. Comment this line if having compilation difficulties

    Serial.println(F("Initializing I2C devices..."));
    mpu.initialize();
    //pinMode(INTERRUPT_PIN, INPUT);

    // verify connection
    Serial.println(F("Testing device connections..."));
    Serial.println(mpu.testConnection() ? F("MPU6050 connection successful") : F("MPU6050 connection failed"));

    // load and configure the DMP
    Serial.println(F("Initializing DMP..."));
    uint8_t devStatus = mpu.dmpInitialize();
    mpu.setXGyroOffset(1);
    mpu.setYGyroOffset(13);
    mpu.setZGyroOffset(-6);
    mpu.setZAccelOffset(800);
    // make sure it worked (returns 0 if so)
    if (devStatus == 0) {
        // turn on the DMP, now that it's ready
        Serial.println(F("Enabling DMP..."));
        mpu.setDMPEnabled(true);
 
        // enable Arduino interrupt detection
        Serial.println(F("Enabling interrupt detection (Arduino external interrupt 0)..."));
        
        //attachInterrupt(digitalPinToInterrupt(INTERRUPT_PIN), dmpDataReady, RISING);
        
        uint8_t mpuIntStatus = mpu.getIntStatus();

        // set our DMP Ready flag so the main loop() function knows it's okay to use it
        Serial.println(F("DMP ready! Waiting for first interrupt..."));
        dmpReady = true;

        // get expected DMP packet size for later comparison
        packetSize = mpu.dmpGetFIFOPacketSize();
    } else {
        // ERROR!
        // 1 = initial memory load failed
        // 2 = DMP configuration updates failed
        // (if it's going to break, usually the code will be 1)
        Serial.print(F("DMP Initialization failed (code "));
        Serial.print(devStatus);
        Serial.println(F(")"));
    }
}


#define echoPin 7 // Echo Pin
#define trigPin 6 // Trigger Pin
void setup_HCSR04()
{
  Serial.println("Setting up HCSR04...");
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  digitalWrite(trigPin, LOW);
}
int read_HCSR04()
{
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(2); 
  digitalWrite(trigPin, LOW);
  
  int pulse_width=0;
  while ( digitalRead(echoPin) == 0 )
  {
    if(pulse_width++>100)
    {
      return -1;  
    }
  }
  pulse_width=0;
  while ( digitalRead(echoPin) == 1 && !(pulse_width==HCSR04_MAX))pulse_width++;
  //Serial.println(pulse_width);

  return pulse_width;
  //delay(50);
}

