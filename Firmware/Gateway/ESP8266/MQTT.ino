#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <SoftwareSerial.h>
SoftwareSerial mySerial(D4, D5); //RX, TX
// Cập nhật thông tin
// Thông tin về wifi
#define ssid "BacHoCuuNuoc 2.4G"
#define password "phuclam2019"
// Thông tin về MQTT Broker
#define mqtt_server "test.mosquitto.org" // Thay bằng thông tin của bạn
#define mqtt_topic_pub "test_ahgsd_dtd_vip_pro_datn"   //Giữ nguyên nếu bạn tạo topic tên là demo
#define mqtt_topic_sub "test_ahgsd_dtd_vip_pro_datn_sub"
#define mqtt_user "duong"    //Giữ nguyên nếu bạn tạo user là esp8266 và pass là 123456
#define mqtt_pwd "123456"

const uint16_t mqtt_port = 1883; //Port của CloudMQTT

WiFiClient espClient;
PubSubClient client(espClient);

long lastMsg = 0;
int value = 0;

void setup() {
  Serial.begin(115200);
  mySerial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port); 
  client.setCallback(callback);
}
// Hàm kết nối wifi
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}
// Hàm call back để nhận dữ liệu
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  mySerial.print("1");
  Serial.println();
}
// Hàm reconnect thực hiện kết nối lại khi mất kết nối với MQTT Broker
void reconnect() {
  // Chờ tới khi kết nối
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Thực hiện kết nối với mqtt user và pass
    if (client.connect("ESP8266Clientadsasdasdsa",mqtt_user, mqtt_pwd)) {
      Serial.println("connected");
      // Khi kết nối sẽ publish thông báo
      client.publish(mqtt_topic_pub, "ESP_reconnected");
      // ... và nhận lại thông tin này
      client.subscribe(mqtt_topic_sub);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Đợi 5s
      delay(5000);
    }
  }
}
void loop() {
  // Kiểm tra kết nối
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
    if(mySerial.available() > 1){
    char msg[50];
    String input = mySerial.readString();
//    int n = input.length(); 
//    char char_array[n + 1];
//    strcpy(char_array, input.c_str());

    int len = input.length();
    Serial.print("Received mess :");
    Serial.println(input);

    char data[100];
    strcpy(data, input.c_str());

    Serial.print("Publish message: ");
    Serial.println(data);
    client.publish(mqtt_topic_pub, data);
   }
}
