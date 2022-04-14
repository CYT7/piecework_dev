/**
 * 接口统一集成模块
 **/
import * as login from './modules/login'
import * as user from './modules/user'
import * as dept from './modules/dept'
import * as role from './modules/role'
import * as menu from './modules/menu'
import * as log from './modules/log'
import * as emp from "./modules/emp";
import * as coefficient from "./modules/coefficient";
import * as performance from "./modules/performance";
//默认全部导出
export default {
    login,
    user,
    dept,
    role,
    menu,
    log,
    emp,
    coefficient,
    performance,
}
