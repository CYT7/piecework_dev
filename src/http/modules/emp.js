import axios from '../axios'
/**
 * 职工管理模块
 **/
//上传
export const upload = (data) => {
  return axios({
    url: '/emp/upload',
    method: 'post',
    headers:{'Content-Type':'multipart/form-data'},
    data,
  })
};
//下载
export const download = (data) => {
  return axios({
    url: '/emp/download',
    method: 'post',
    data
  })
};
//分页查询
export const findPage = (data) => {
  return axios({
    url: '/emp/findPage',
    method: 'post',
    data
  })
};
//根据部门id导出职工列表
export const findEmpTree =(params) =>{
  return axios({
    url: '/emp/findEmpTree',
    method: 'post',
    params
  })
};
//保存
export const save = (data) => {
  return axios({
    url: '/emp/save',
    method: 'post',
    data
  })
};
//批量禁用
export const unconfirmed = (data) => {
  return axios({
    url: '/emp/unconfirmed',
    method: 'post',
    data
  })
};
//批量恢复
export const confirm = (data) => {
  return axios({
    url: '/emp/confirm',
    method: 'post',
    data
  })
};
//删除
export const Delete = (data) => {
  return axios({
    url: '/emp/delete',
    method: 'post',
    data
  })
};
