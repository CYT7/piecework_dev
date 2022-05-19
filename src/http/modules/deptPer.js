import axios from '../axios'
/**
 * 部门绩效管理模块
 **/
//分页查询
export const findPage = (data) => {
  return axios({
    url: '/DeptPer/findPage',
    method: 'post',
    data
  })
};
//保存
export const save = (data) => {
  return axios({
    url: '/DeptPer/save',
    method: 'post',
    data
  })
};

