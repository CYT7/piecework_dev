import axios from '../axios'
/**
 * 部门职工管理模块
 **/
//分页查询
export const findPage = (data) => {
  return axios({
    url: '/DeptEmp/findPage',
    method: 'post',
    data
  })
};
//保存
export const save = (data) => {
  return axios({
    url: '/DeptEmp/save',
    method: 'post',
    data
  })
};