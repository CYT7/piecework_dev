import axios from '../axios'
/**
 * 用户管理模块
 **/
//保存
export const save = (data) => {
  return axios({
    url: '/performance/save',
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
