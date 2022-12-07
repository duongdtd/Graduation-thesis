/*
 * lcd.c
 *
 *  Created on: Jun 29, 2022
 *      Author: ADMIN
 */
#include <lib/i2c_lib.h>
#include <lib/lcd.h>
void lcd_send_cmd (char cmd)
{
  char data_u, data_l;
  uint8_t data_t[4];
  data_u = (cmd&0xf0);
  data_l = ((cmd<<4)&0xf0);
  data_t[0] = data_u|0x0C;  //en=1, rs=0
  data_t[1] = data_u|0x08;  //en=0, rs=0
  data_t[2] = data_l|0x0C;  //en=1, rs=0
  data_t[3] = data_l|0x08;  //en=0, rs=0
  i2c_write_nBytes(LCD_ADDR, data_t, 4);

}

void lcd_send_data (char data)
{
  char data_u, data_l;
  uint8_t data_t[4];
  data_u = (data&0xf0);
  data_l = ((data<<4)&0xf0);
  data_t[0] = data_u|0x0D;  //en=1, rs=0
  data_t[1] = data_u|0x09;  //en=0, rs=0
  data_t[2] = data_l|0x0D;  //en=1, rs=0
  data_t[3] = data_l|0x09;  //en=0, rs=0
  i2c_write_nBytes(LCD_ADDR,data_t, 4);
}

void lcd_init (void)
{
  lcd_send_cmd (0x33); /* set 4-bits interface */
  sl_sleeptimer_delay_millisecond(4);
  lcd_send_cmd (0x32);
  sl_sleeptimer_delay_millisecond(50);
  lcd_send_cmd (0x28); /* start to set LCD function */
  sl_sleeptimer_delay_millisecond(50);
  lcd_send_cmd (0x01); /* clear display */
  sl_sleeptimer_delay_millisecond(50);
  lcd_send_cmd (0x06); /* set entry mode */
  sl_sleeptimer_delay_millisecond(50);
  lcd_send_cmd (0x0c); /* set display to on */
  sl_sleeptimer_delay_millisecond(50);
  lcd_send_cmd (0x02); /* move cursor to home and set data address to 0 */
  sl_sleeptimer_delay_millisecond(50);
  lcd_send_cmd (0x80);
}

void lcd_send_string (char *str)
{
  while (*str) lcd_send_data (*str++);
}

void lcd_clear (void)
{
  lcd_send_cmd (0x01); //clear display
}

void lcd_goto_XY (int row, int col)
{
  uint8_t pos_Addr;
  if(row == 1)
  {
    pos_Addr = 0x80 + row - 1 + col;
  }
  else
  {
    pos_Addr = 0x80 | (0x40 + col);
  }
  lcd_send_cmd(pos_Addr);
}
void lcd_on_display()
{
  i2c_write_nBytes(LCD_ADDR,(int)(0)|0x08,1);
}
void lcd_off_display()
{
  i2c_write_nBytes(LCD_ADDR,(int)(0)|0x00,1);

}

