import axios from '../axios'
/**
 * 系数管理模块
 **/
//保存
export const save = (data) => {
  return axios({
    url: '/coefficient/save',
    method: 'post',
    data
  })
};
//删除
export const batchDelete = (data) => {
  return axios({
    url: '/coefficient/delete',
    method: 'post',
    data
  })
};
//批量禁用
export const batchDisable = (data) => {
  return axios({
    url: '/coefficient/disable',
    method: 'post',
    data
  })
};
//批量恢复
export const batchRecover = (data) => {
  return axios({
    url: '/coefficient/recover',
    method: 'post',
    data
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
export const findCoefficientTree = (params) => {
  return axios({
    url: '/coefficient/findCoefficientTree',
    method: 'post',
    params
  })
};
