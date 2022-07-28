import axios from '../axios'

/**
 * 操作日志模块
 **/
//分页查询
export const findPage = (data) => {
  return axios({
    url: '/log/findPage',
    method: 'post',
    data
  })
};
//删除
export const Delete = (data) => {
  return axios({
    url: '/log/delete',
    method: 'post',
    data
  })
};
