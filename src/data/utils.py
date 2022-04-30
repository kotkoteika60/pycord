import datetime

def message_timestamp(dt):
    cur_day = datetime.datetime.now().day
    if dt.day == cur_day:
        return dt.strftime("сегодня, %H:%M")
    elif cur_day - dt.day == 1:
        return dt.strftime("вчера, %H:%M")
    elif cur_day - dt.day == 1:
        return dt.strftime("позавчера, %H:%M")
    else:
    	return dt.strftime("%d.%m.%y, %H:%M")