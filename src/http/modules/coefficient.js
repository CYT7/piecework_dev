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
//查询系数树
export const findCoefficientTree = (params) => {
  return axios({
    url: '/coefficient/findCoefficientTree',
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
