import axios from '../axios'
/**
 * 职工管理模块
 **/
//分页查询
export const upload = (data) => {
  return axios({
    url: '/emp/upload',
    method: 'post',
    headers:{'Content-Type':'multipart/form-data'},
    data,
  })
};
//分页查询
export const findPage = (data) => {
  return axios({
    url: '/emp/findPage',
    method: 'post',
    data
  })
};
//根据部门id导出职工列表
export const findEmpTree =(params) =>{
  return axios({
    url: '/emp/findEmpTree',
    method: 'post',
    params
  })
};
//保存
export const save = (data) => {
  return axios({
    url: '/emp/save',
    method: 'post',
    data
  })
};
//批量禁用
export const disable = (data) => {
  return axios({
    url: '/emp/disable',
    method: 'post',
    data
  })
};
//批量恢复
export const recover = (data) => {
  return axios({
    url: '/emp/recover',
    method: 'post',
    data
  })
};
//删除
export const Delete = (data) => {
  return axios({
    url: '/emp/delete',
    method: 'post',
    data
  })
};
