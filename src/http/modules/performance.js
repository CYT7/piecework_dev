import axios from '../axios'
/**
 * 用户管理模块
 **/
//保存
export const save = (data) => {
  return axios({
    url: '/user/save',
    method: 'post',
    data
  })
};
//删除
export const batchDelete = (data) => {
  return axios({
    url: '/user/delete',
    method: 'post',
    data
  })
};
//批量禁用
export const batchDisable = (data) => {
  return axios({
    url: '/user/disable',
    method: 'post',
    data
  })
};
//批量恢复
export const batchRecover = (data) => {
  return axios({
    url: '/user/recover',
    method: 'post',
    data
  })
};
//分页查询
export const findPage = (data) => {
  return axios({
    url: '/performance/findPage',
    method: 'post',
    data
  })
};
export const findPages = (data) => {
  return axios({
    url: '/performance/findPages',
    method: 'post',
    data
  })
};
