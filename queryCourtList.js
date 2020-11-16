
var axios = require('axios');
var FormData = require('form-data');

const sendMsgToDingTalk = (msg) => {
  let data = {
    msgtype:'markdown',
    markdown:{
      title:'网球播报',
      text:msg,
    }
  }
  var config = {
    method: 'post',
    url: 'https://oapi.dingtalk.com/robot/send?access_token=f59654c7d172272c3a833e4370933d20ab8485da69d146c03dd54fff93ff092f',
    headers: {
      'Content-Type': 'application/json'
    },
    data : data
  };
  axios(config)
}

const scheduleList = [
  {
    date: '2020.11.17',
    sign: 'C61004E152745DB9C75079F76352CB1C',
  },
  {
    date: '2020.11.18',
    sign: '2A757A8F997462476683D1B2E4DA7C3E',
  },
  {
    date: '2020.11.19',
    sign: '9B1013C0FE84709A639F9251F4A3BFBA',
  },
  {
    date: '2020.11.20',
    sign: 'E80FC2A25B530E524BCE3F2AC3140A24',
  },
  {
    date: '2020.11.21',
    sign: 'A5E7F9AB7D6B0DC344D7B87987E412F2',
  },
];

const query = async({date,sign}) => {
  var data = new FormData();
  data.append('biz', 'apiGetStadiumShedule');
  data.append('date', Number(new Date(date))/1000 + '');
  data.append('method', 'ios');
  data.append('nonce', 'qscvhi91rdxvgy76543efbxdr5hjk1aq');
  data.append('sign', sign);
  data.append('stadiumid', '153');
  data.append('userid', '52291');

  var config = {
    method: 'post',
    url: 'http://yd8.sports8.com.cn/api/ydb/stadium/apiGetStadiumShedule',
    headers: {
      ...data.getHeaders()
    },
    data : data
  };
  let msg = ''
  let response = await axios(config);
  if(response.data.returnCode == 0){
    const {fieldList,stadiumName} = response.data.returnData;
    let availableList = fieldList[0].shedule.filter(e=> e.status == 0);
    if(availableList.length> 0){
      msg += `### ${stadiumName}${date}可订时间段: \n`
      for(let item of availableList){
        msg += `- ${item.name} 价格:${item.expense} 时间:${item.timePoint}-${item.timePoint + 1} \n`
      }
    }
  }
  return msg
}

const queryAll = async() => {
  let msg = ''
  for(let item of scheduleList){
    msg += await query(item)
  }
  sendMsgToDingTalk(msg)
}

const polling = async() => {
  let currHour = new Date().getHours()
  if(currHour > 8 && currHour < 24){
    await queryAll()
    console.log('Query success')
  }
  setTimeout(()=>{
    polling()
  },1000 * 60 * 30)
}

polling()
