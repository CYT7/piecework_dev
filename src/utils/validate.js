//邮箱
export function isEmail (s) {
  return /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/.test(s)
}
