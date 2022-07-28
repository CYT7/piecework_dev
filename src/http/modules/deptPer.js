import axios from '../axios'

/**
 * 部门绩效管理模块
 **/
//分页查询
export const findPage = (data) => {
  return axios({
    url: '/DeptPer/findPage',
    method: 'post',
    data
  })
};
//新增
export const save = (data) => {
  return axios({
    url: '/DeptPer/add',
    method: 'post',
    data
  })
};
//新增
export const findEmp = (data) => {
  return axios({
    url: '/DeptPer/findEmp',
    method: 'post',
    data
  })
};
//更新
export const update = (data) => {
  return axios({
    url: '/DeptPer/update',
    method: 'post',
    data
  })
};
export const confirm = (data) => {
  return axios({
    url: '/DeptPer/confirm',
    method: 'post',
    data
  })
};
//上传
export const upload = (data) => {
  return axios({
    url: '/DeptPer/upload',
    method: 'post',
    headers: {'Content-Type': 'multipart/form-data'},
    data,
  })
};

