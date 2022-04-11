import axios from '../axios'
/**
 * 职工管理模块
 **/
//保存
export const save = (data) => {
  return axios({
    url: '/emp/save',
    method: 'post',
    data
  })
};
//删除
export const batchDelete = (data) => {
  return axios({
    url: '/emp/delete',
    method: 'post',
    data
  })
};
//批量禁用
export const batchDisable = (data) => {
  return axios({
    url: '/emp/disable',
    method: 'post',
    data
  })
};
//批量恢复
export const batchRecover = (data) => {
  return axios({
    url: '/emp/recover',
    method: 'post',
    data
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
//导出Excel用户信息
export const exportUserExcelFile = (data) => {
  return axios({
    url: '/emp/exportUserExcelFile',
    method: 'post',
    data
  })
};
