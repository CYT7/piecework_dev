/**
 * 时间日期相关操作
 **/
//时间格式化
export function format (datetime) {
  return formatWithSeparator(datetime, "/", ":");
}
export function formats (datetime) {
  return formatWithSeparators(datetime, "/");
}
//时间格式化
export function formatWithSeparator (datetime, dateSeparator, timeSeparator) {
  if (datetime != null) {
    const dateMat = new Date(datetime);
    const year = dateMat.getFullYear();
    const month = dateMat.getMonth() + 1;
    const day = dateMat.getDate();
    const hh = dateMat.getHours();
    const mm = dateMat.getMinutes();
    const ss = dateMat.getSeconds();
    return year + dateSeparator + month + dateSeparator + day + " " + hh + timeSeparator + mm + timeSeparator + ss;
  }
}
export function formatWithSeparators (datetime, dateSeparator) {
  if (datetime != null) {
    const dateMat = new Date(datetime);
    const year = dateMat.getFullYear();
    const month = dateMat.getMonth() + 1;
    return year + dateSeparator + month;
  }
}
