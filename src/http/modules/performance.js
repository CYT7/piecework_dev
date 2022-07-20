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
//通过绩效
export const confirm = (data) => {
  return axios({
    url: '/performance/agree',
    method: 'post',
    data
  })
};
//未通过绩效
export const disagree = (data) => {
  return axios({
    url: '/performance/disagree',
    method: 'post',
    data
  })
};
