import axios from '../axios'
/**
 * 用户管理模块
 **/
//分页查询
export const findPage = (data) => {
  return axios({
    url: '/user/findPage',
    method: 'post',
    data
  })
};
//根据用户名查找
export const findByName = (params) => {
  return axios({
    url: '/user/findByName',
    method: 'get',
    params
  })
};
//查找用户的菜单权限标识集合
export const findPermissions = (params) => {
  return axios({
    url: '/user/findPermissions',
    method: 'get',
    params
  })
};
//保存
export const save = (data) => {
    return axios({
        url: '/user/save',
        method: 'post',
        data
    })
};
//更新用户密码
export const updatePwd = (data) => {
  return axios({
    url: '/user/updatePassword',
    method: 'post',
    data
  })
};
//删除
export const Delete = (data) => {
    return axios({
        url: '/user/delete',
        method: 'post',
        data
    })
};
//批量禁用
export const disable = (data) => {
  return axios({
    url: '/user/disable',
    method: 'post',
    data
  })
};
//批量恢复
export const recover = (data) => {
  return axios({
    url: '/user/recover',
    method: 'post',
    data
  })
};
//根据用户名查找
export const personalCenter = () => {
  return axios({
    url: '/user/personalCenter',
    method: 'post',
  })
};
