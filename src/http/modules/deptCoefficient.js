import axios from '../axios'
/**
 * 系数管理模块
 **/
//分页查询
export const findPage = (data) => {
  return axios({
    url: '/deptCoe/findPage',
    method: 'post',
    data
  })
};
//保存
export const save = (data) => {
  return axios({
    url: '/deptCoe/save',
    method: 'post',
    data
  })
};
//批量禁用
export const disable = (data) => {
  return axios({
    url: '/deptCoe/disable',
    method: 'post',
    data
  })
};
//批量恢复
export const recover = (data) => {
  return axios({
    url: '/deptCoe/recover',
    method: 'post',
    data
  })
};
