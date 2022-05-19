import axios from '../axios'
/**
 * 部门管理模块
 **/
//查询机构树
export const findDeptTree = () => {
  return axios({
    url: '/dept/findTree',
    method: 'get'
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

