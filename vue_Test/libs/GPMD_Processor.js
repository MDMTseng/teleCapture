var GPMD={
  func1:()=>{
    quat1 = new THREE.Quaternion();
    console.log(quat1)
  },
  GetTimeDiff:(IMU_data,dataType_str,group,data_idx)=>{
    var IMU_group_base=IMU_data[group];

    while(data_idx>=IMU_group_base[dataType_str].length)
    {
      data_idx-=IMU_group_base[dataType_str].length;

      if(group==IMU_data.length-1)return -1;
      group++;
      IMU_group_base=IMU_data[group];
    }
    var ratio_stps2data=1.0*IMU_group_base.STPS.length/IMU_group_base[dataType_str].length;
    var STP_L_IDX=Math.floor(ratio_stps2data*data_idx);
    var STP_L=IMU_group_base.STPS[STP_L_IDX];
    var STP_H=0;
    if(STP_L_IDX==IMU_group_base.STPS.length-1)
    {
      if(group==IMU_data.length-1)return -1;
      var IMU_group_next=IMU_data[group+1];
      STP_H=IMU_group_next.STPS[0];
    }
    else {
      STP_H=IMU_group_base.STPS[STP_L_IDX+1];
    }
/*
    console.log("group:",group);
    console.log("IMU_group_base:",IMU_group_base);
    console.log("ratio_stps2data:",ratio_stps2data);
    console.log("STP_L_IDX:",STP_L_IDX);
    console.log("STP_H:",STP_H," STP_L:",STP_L);*/
    //IMU_group_base.STPS[STP_low_IDX];
    return (STP_H-STP_L)*ratio_stps2data;
  },
  ProcessGYRO:(GYRO_data)=>{




    GYRO_data.forEach((GYRO_data_group)=>{
      var SCAL=GYRO_data_group.SCAL;
      GYRO_data_group.EULER=[];
      for(i=0;i<GYRO_data_group.GYRO.length;i+=3)
      {
        var euler = new THREE.Euler(GYRO_data_group.GYRO[i+0]/SCAL, GYRO_data_group.GYRO[i+1]/SCAL, GYRO_data_group.GYRO[i+2]/SCAL);
        //ptr order is [0]=X [1]=Y [2]=Z
        GYRO_data_group.EULER.push(euler);
      }
    });

    console.log(">>>>>>>>>>",GPMD.GetTimeDiff(GYRO_data,"EULER",0,3100));

  },
  //Front Camera Up      is [2]/Z axis,   Yaw ,heading
  //Front Camera left    is [1]/Y axis    Pitch,attitude
  //Front camera forward is [0]/X axis    Roll,bank
  extractIMUData:(gpmf_metadata)=>{
    var GYRO_data = [];
    var ACCL_data = [];
    var MAGN_data = [];
    gpmf_metadata.DEVCs.forEach((DEVC)=>{
      DEVC.STRMs.forEach((STRM)=>{
        if(typeof( STRM.GYRO) != 'undefined')
          GYRO_data.push(STRM);
        else if(typeof( STRM.ACCL) != 'undefined')
          ACCL_data.push(STRM);
        else if(typeof( STRM.MAGN) != 'undefined')
          MAGN_data.push(STRM);
      });
    });
    GPMD.ProcessGYRO(GYRO_data);
    console.log(GYRO_data);

  }


}


var UTILITY={
  fix:(txt)=>{
    result=txt.replace(/(\n|\r|\s)/gm, "")
              .replace('","DEVC":','","DEVCs":[')
              .replace(/\},\"STRM\":/g,'},')
              .replace(/,\"STRM\":/g,',"STRMs":[')
              .replace(/\"DEVC\":/g,'')
              .replace(/\}\},\{\"/g, '}]},{"')
              .replace(/\},\}/g, "]}]}");
    return result;
  },
  fetch_txt:(METHOD,URL,promise)=>{
    var xhr = new XMLHttpRequest();
    xhr.open(METHOD, URL);
    xhr.onload = function() {
        if (xhr.status === 200) {
            promise.resolve(xhr.responseText);
        }
        else {
            promise.reject(xhr);
        }
    };
    xhr.send();
  },
  ajax:(METHOD,URL,promise)=>{

    UTILITY.fetch_txt(METHOD,URL,{
      resolve:(txt)=>{
          var obj=JSON.parse(txt);
          promise.resolve(obj);
      },
      reject:promise.reject
    });
  },
  ajax_fix_gpmf2json:(METHOD,URL,promise)=>{

    UTILITY.fetch_txt(METHOD,URL,{
      resolve:(txt)=>{
          var obj=JSON.parse(UTILITY.fix(txt));
          promise.resolve(obj);
      },
      reject:promise.reject
    });
  }



}
