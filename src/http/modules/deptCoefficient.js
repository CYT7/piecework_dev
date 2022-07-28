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
//查询系数树
export const findCoefficientTree = (data) => {
  return axios({
    url: '/deptCoe/findCoefficientTree',
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
//保存
export const saveScheme = (data) => {
  return axios({
    url: '/deptCoe/saveScheme',
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
//批量禁用
export const disableScheme = (data) => {
  return axios({
    url: '/deptCoe/disableScheme',
    method: 'post',
    data
  })
};
//批量恢复
export const recoverScheme = (data) => {
  return axios({
    url: '/deptCoe/recoverScheme',
    method: 'post',
    data
  })
};
