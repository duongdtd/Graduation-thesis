/*
 * AS608.c
 *
 *  Created on: Jul 12, 2022
 *      Author: ADMIN
 */

#include <lib/AS608.h>
#include <lib/usart0_lib.h>
#include"stdint.h"


uint8_t recvPacket[20];
void send_cmd (uint8_t identifier, uint8_t len, uint8_t *packet, uint8_t s_packet,
          uint8_t n)
{
  uint8_t package[n];
  package[0] = FINGERPRINT_STARTCODE >> 8;
  package[1] = FINGERPRINT_STARTCODE;
  for (uint8_t i = 2; i < 6; i++)
    {
      package[i] = 0xFF;
    }
  package[6] = identifier;
  package[7] = len >> 8;
  package[8] = len;
  uint16_t sum = len + identifier;
  for (int i = 9; i < s_packet + 9; i++)
    {
      package[i] = packet[i - 9];
      sum += package[i];
    }
  package[n - 2] = sum >> 8;
  package[n - 1] = sum;

  send_data (package, n);

}

void verifyPassword ()
{
  uint8_t packet[] =
    { FINGERPRINT_VERIFYPASSWORD, 0x00, 0x00, 0x00, 0x00 };
  send_cmd (FINGERPRINT_COMMANDPACKET, 7, packet, 5, 16);
}

void getImage ()
{
  uint8_t packet[] =
    { FINGERPRINT_GETIMAGE };
  send_cmd (FINGERPRINT_COMMANDPACKET, 3, packet, 1, 12);
}
void image2Tz (uint8_t slot)
{
  uint8_t packet[] =
    { FINGERPRINT_IMAGE2TZ, slot };
  send_cmd (FINGERPRINT_COMMANDPACKET, 4, packet, 2, 13);

}
void createModel ()
{
  uint8_t packet[] =
    { FINGERPRINT_REGMODEL };
  send_cmd (FINGERPRINT_COMMANDPACKET, 3, packet, 1, 12);

}
void storeModel (uint16_t id)
{
  uint8_t packet[] =
    { FINGERPRINT_STORE, 0x02, 0, 0 };
  packet[2] = id >> 8;
  packet[3] = id & 0xFF;
  send_cmd (FINGERPRINT_COMMANDPACKET, 6, packet, 4, 15);
}
void searchFinger()
{
  uint8_t packet[] = {FINGERPRINT_HISPEEDSEARCH, 0x01, 0x00, 0x00, 0x00, 0xA3};
  send_cmd(FINGERPRINT_COMMANDPACKET, 8, packet,6,17);
}
void deleteFinger(uint16_t id)
{
  uint8_t packet[] = {FINGERPRINT_DELETE, id >> 8, id & 0xFF, 0x00, 0x01};
  packet[1] = id >> 8;
  packet[2] = id & 0xFF;
  send_cmd (FINGERPRINT_COMMANDPACKET, 7, packet, 5, 16);
}
void emptyDatabse()
{
  uint8_t packet[] = {FINGERPRINT_EMPTY};
  send_cmd(FINGERPRINT_COMMANDPACKET, 3, packet, 1, 12);
}

