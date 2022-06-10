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
