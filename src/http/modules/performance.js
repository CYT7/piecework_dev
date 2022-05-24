import axios from '../axios'
/**
 * 绩效管理模块
 **/
//分页查询
export const findPage = (data) => {
  return axios({
    url: '/performance/findPage',
    method: 'post',
    data
  })
};
//新增
export const save = (data) => {
  return axios({
    url: '/performance/add',
    method: 'post',
    data
  })
};
//更新
export const update = (data) => {
  return axios({
    url: '/performance/update',
    method: 'post',
    data
  })
};
export const confirm = (data) => {
  return axios({
    url: '/performance/confirm',
    method: 'post',
    data
  })
};
