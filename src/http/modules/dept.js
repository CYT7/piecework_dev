import axios from '../axios'

/**
 * 部门管理模块
 **/
//查询机构树
export const findTree = () => {
  return axios({
    url: '/dept/findTree',
    method: 'get'
  })
};
export const findDeptTree = (params) => {
  return axios({
    url: '/dept/findDeptTree',
    method: 'get',
    params
  })
};
//保存
export const save = (data) => {
  return axios({
    url: '/dept/save',
    method: 'post',
    data
  })
};
//删除
export const Delete = (data) => {
  return axios({
    url: '/dept/delete',
    method: 'post',
    data
  })
};

