# datepicker

> 一款基于原生javascript制作的简易日历组件，支持年月日时分秒选择及自定义日期格式.测试兼容IE7+，IE6存在理论上的支持

## [Demo page](https://jinming6568.github.io/datepicker/)

## 参数/Options

| Name     | Type          | Default      | Description |
| -------- | ------------- | ------------ | ----------- |
| triEle   | String/Object |  ''          | 触发日历组件的元素DOM对象或是元素ID |
| format   | String        | 'yyyy-mm-dd' | 'yyyy-mm-dd hh:ii:ss' 对应年月日时分秒，可自由填写分隔符（现版本格式最少需要yyyy-mm-dd，即年月日，时分秒为可选项）  |
| showTime | Boolean       |     false    | 是否显示时分秒的选项，默认为false |
| change   | Function      |      null    | 用户选择日期后的回调函数，如果定义了change函数，默认就不会将值自动填写入触发元素中 |

