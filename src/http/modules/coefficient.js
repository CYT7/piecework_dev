import axios from '../axios'

/**
 * 系数管理模块
 **/
//上传
export const upload = (data) => {
  return axios({
    url: '/coefficient/upload',
    method: 'post',
    headers: {'Content-Type': 'multipart/form-data'},
    data,
  })
};
//分页查询
export const findPage = (data) => {
  return axios({
    url: '/coefficient/findPage',
    method: 'post',
    data
  })
};
//查询方案树
export const findCoefficientTree = (data) => {
  return axios({
    url: '/coefficient/findCoefficientTree',
    method: 'post',
    data
  })
};
//查询方案下系数树
export const findCoeList = (params) => {
  return axios({
    url: '/coefficient/findCoeList',
    method: 'post',
    params
  })
};
//保存
export const save = (data) => {
  return axios({
    url: '/coefficient/save',
    method: 'post',
    data
  })
};
//保存
export const saveScheme = (data) => {
  return axios({
    url: '/coefficient/saveScheme',
    method: 'post',
    data
  })
};
//删除系数
export const Delete = (data) => {
  return axios({
    url: '/coefficient/delete',
    method: 'post',
    data
  })
};
//删除方案
export const DeleteScheme = (data) => {
  return axios({
    url: '/coefficient/deleteScheme',
    method: 'post',
    data
  })
};
//通过方案
export const confirmScheme = (data) => {
  return axios({
    url: '/coefficient/confirmScheme',
    method: 'post',
    data
  })
};
//未通过方案
export const unconfirmedScheme = (data) => {
  return axios({
    url: '/coefficient/unconfirmedScheme',
    method: 'post',
    data
  })
};
//通过方案
export const confirm = (data) => {
  return axios({
    url: '/coefficient/confirm',
    method: 'post',
    data
  })
};
//未通过方案
export const unconfirmed = (data) => {
  return axios({
    url: '/coefficient/unconfirmed',
    method: 'post',
    data
  })
};
