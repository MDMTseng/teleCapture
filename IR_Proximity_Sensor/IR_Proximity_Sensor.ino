int sensorPin = 0; //analog pin 0

void setup(){
Serial.begin(115200);
}

void loop(){
int val = analogRead(sensorPin);
Serial.println(val);

//just to slow down the output – remove if trying to catch an object passing by
delay(10);

}
