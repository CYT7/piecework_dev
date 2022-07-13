import axios from '../axios'
/**
 * 部门职工管理模块
 **/
//上传
export const upload = (data) => {
  return axios({
    url: '/DeptEmp/upload',
    method: 'post',
    headers:{'Content-Type':'multipart/form-data'},
    data,
  })
};
//分页查询
export const findPage = (data) => {
  return axios({
    url: '/DeptEmp/findPage',
    method: 'post',
    data
  })
};
//保存
export const save = (data) => {
  return axios({
    url: '/DeptEmp/save',
    method: 'post',
    data
  })
};
//批量禁用
export const disable = (data) => {
  return axios({
    url: '/DeptEmp/disable',
    method: 'post',
    data
  })
};
//批量恢复
export const recover = (data) => {
  return axios({
    url: '/DeptEmp/recover',
    method: 'post',
    data
  })
};
