import axios from '../axios'
/**
 * 系数管理模块
 **/
//上传
export const upload = (data) => {
  return axios({
    url: '/coefficient/upload',
    method: 'post',
    headers:{'Content-Type':'multipart/form-data'},
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
//删除
export const Delete = (data) => {
  return axios({
    url: '/coefficient/delete',
    method: 'post',
    data
  })
};
//批量禁用
export const disable = (data) => {
  return axios({
    url: '/coefficient/disable',
    method: 'post',
    data
  })
};
//批量恢复
export const recover = (data) => {
  return axios({
    url: '/coefficient/recover',
    method: 'post',
    data
  })
};
//删除
export const DeleteScheme = (data) => {
  return axios({
    url: '/coefficient/deleteScheme',
    method: 'post',
    data
  })
};
//批量禁用
export const disableScheme = (data) => {
  return axios({
    url: '/coefficient/disableScheme',
    method: 'post',
    data
  })
};
//批量恢复
export const recoverScheme = (data) => {
  return axios({
    url: '/coefficient/recoverScheme',
    method: 'post',
    data
  })
};
