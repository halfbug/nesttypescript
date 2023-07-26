export const getDateDifference = (expiredAt) => {
  const expiryDate = new Date(expiredAt);
  const currentDate = new Date();
  const diff = expiryDate.getTime() - currentDate.getTime();
  if (diff < 0) {
    return {
      time: diff,
      days: 0,
      hrs: 0,
      mins: 0,
      secs: 0,
    };
  }
  return {
    time: diff,
    days: Math.floor(diff / 86400000), // days
    hrs: Math.floor((diff % 86400000) / 3600000), // hours
    mins: Math.round(((diff % 86400000) % 3600000) / 60000), // minutes
    secs: Math.round(((diff % 86400000) % 3600000) / 60000 / 60000), // seconds
  };
};

export function addDays(date: Date, number: number) {
  const newDate = new Date(date);
  return new Date(newDate.setDate(newDate.getDate() + number));
}

export function monthsArr(mon: number) {
  const months = [
    { initial: 'Jan', mon: 'January', endDate: 31 },
    { initial: 'Feb', mon: 'February', endDate: 28 },
    { initial: 'Mar', mon: 'March', endDate: 31 },
    { initial: 'Apr', mon: 'April', endDate: 30 },
    { initial: 'May', mon: 'May', endDate: 31 },
    { initial: 'Jun', mon: 'June', endDate: 30 },
    { initial: 'Jul', mon: 'July', endDate: 31 },
    { initial: 'Aug', mon: 'August', endDate: 31 },
    { initial: 'Sep', mon: 'September', endDate: 30 },
    { initial: 'Oct', mon: 'October', endDate: 31 },
    { initial: 'Nov', mon: 'November', endDate: 30 },
    { initial: 'Dec', mon: 'December', endDate: 31 },
  ];
  return months[mon];
}
export function Days(day: number) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[day];
}
export function DateFormats(month: string, year: string) {
  const yearNum = +year;
  const startDay = Days(
    new Date(`${monthsArr(+month - 1).mon} 1, ${yearNum}`).getDay(),
  );
  const curMonth = monthsArr(+month - 1).initial;
  const lastdate = monthsArr(+month - 1).endDate;
  const sdate = new Date(`${startDay}, 01 ${curMonth} ${yearNum} 00:00:00 GMT`);
  const edate = new Date(
    `${startDay}, ${lastdate} ${curMonth} ${yearNum} 23:59:00 GMT`,
  );
  return {
    sdate,
    edate,
  };
}

export function generatesecondaryCount() {
  const min = 100;
  const max = 500;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
