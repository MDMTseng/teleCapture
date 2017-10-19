
let ifshowEuler=true;

let DrawVectorGraph=(data_set,x,y,width,ValueScale=1)=>{


    if(typeof( data_set[0]['x']) != 'undefined')
      DrawGraph(data_set,'x','#FF0000',x,y,width,ValueScale);
    if(typeof( data_set[0]['_x']) != 'undefined')
      DrawGraph(data_set,'_x','#FF0000',x,y,width,ValueScale);


    if(typeof( data_set[0]['y']) != 'undefined')
      DrawGraph(data_set,'y','#00FF00',x,y,width,ValueScale);
    if(typeof( data_set[0]['_y']) != 'undefined')
      DrawGraph(data_set,'_y','#00FF00',x,y,width,ValueScale);


    if(typeof( data_set[0]['z']) != 'undefined')
      DrawGraph(data_set,'z','#0000FF',x,y,width,ValueScale);
    if(typeof( data_set[0]['_z']) != 'undefined')
      DrawGraph(data_set,'_z','#0000FF',x,y,width,ValueScale);

    if(typeof( data_set[0]['w']) != 'undefined')
      DrawGraph(data_set,'w','#AA00AA',x,y,width,ValueScale);

    DrawXAxis(0,y);


}

let DrawGraph=(data_set,key,color_str,x,y,width,yscal=1,interval=1)=>{

  if(width ==0)return;
  let xscale=width/data_set.length;


  let pre_data=data_set[0];

  let c = document.getElementById("myCanvas");
  let ctx = c.getContext("2d");

  ctx.beginPath();
  ctx.strokeStyle=color_str;

  for(i=interval;i<data_set.length;i+=interval)
  {
    let cur_data=data_set[i];
    ctx.moveTo(xscale*(i-interval)+x, -pre_data[key]*yscal+y);
    ctx.lineTo(xscale*(i)+x,   -cur_data[key]*yscal+y);      
    pre_data=cur_data;
    
  }
  ctx.stroke();
}

let DrawXAxis=(x,y,color_str='#000000')=>
{

  DrawGraph([{_x:0},{_x:0}],'_x',color_str,x,y,5000);
}


let GPMD={
  func1:()=>{
    quat1 = new THREE.Quaternion();
    console.log(quat1)
  },
  findRealGroupIdx:(IMU_data,dataType_str,group,idx)=>{
    if(group>=IMU_data.length)
    {
      return null;
    }
    let IMU_group_base=IMU_data[group];

    while(idx>=IMU_group_base[dataType_str].length)
    {
      idx-=IMU_group_base[dataType_str].length;

      if(group==IMU_data.length-1)return -1;
      group++;
      
      if(group>=IMU_data.length)
      {
        return null;
      }

      IMU_group_base=IMU_data[group];
    }
    return {
      group:group,
      idx:idx
    };
  },
  GetDataTimePoint_us:(IMU_data,dataType_str,group,data_idx)=>{

    gidx=GPMD.findRealGroupIdx(IMU_data,dataType_str,group,data_idx);

    group=gidx.group;
    data_idx=gidx.idx;

    let IMU_group_base=IMU_data[group];

    let ratio_stps2data=1.0*IMU_group_base.STPS.length/IMU_group_base[dataType_str].length;
    let STP_L_ratio=ratio_stps2data*data_idx;
    let STP_L_IDX=Math.floor(STP_L_ratio);
    STP_L_ratio-=STP_L_IDX;
    let STP_L=IMU_group_base.STPS[STP_L_IDX];


    gidx=GPMD.findRealGroupIdx(IMU_data,"STPS",group,STP_L_IDX+1);

    let STP_H=IMU_data[gidx.group].STPS[gidx.idx];

    return (STP_H-STP_L)*STP_L_ratio+STP_L;
  },
  GetTimeDiff_us:(IMU_data,dataType_str,group,data_idx)=>{

    gidx=GPMD.findRealGroupIdx(IMU_data,dataType_str,group,data_idx);

    group=gidx.group;
    data_idx=gidx.idx;

    let IMU_group_base=IMU_data[group];

    let ratio_stps2data=1.0*IMU_group_base.STPS.length/IMU_group_base[dataType_str].length;
    let STP_L_IDX=Math.floor(ratio_stps2data*data_idx);
    let STP_L=IMU_group_base.STPS[STP_L_IDX];
    let STP_H=0;
    if(STP_L_IDX==IMU_group_base.STPS.length-1)
    {
      if(group==IMU_data.length-1)
      {
        console.log("sss");
        return -1;
      }
      let IMU_group_next=IMU_data[group+1];
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
  GetIDX_us:(IMU_data,dataType_str,time_us,start_group=0,start_index=0)=>{
    let i=0,j=0;

    if(IMU_data[start_group].STPS[0]>time_us)
    {
      start_group=0;
    }
    else
    {
      start_group++;
    }


    let time_H=0;

    for(i=start_group;i<IMU_data.length;)
    {
      if(IMU_data[i].STPS[0]>time_us)
      {
        time_H=IMU_data[i].STPS[0];
        i--;
        break;
      }
      i++;
    }

    if(i<0 || i>=IMU_data.length)
    {
      return null;
    }

    let IMU_group_base_idx=i;
    let IMU_group_base=IMU_data[i];


    for(j=start_index;j<IMU_group_base.STPS.length;)
    {
      if(IMU_group_base.STPS[j]>time_us)
      {
        time_H=IMU_group_base.STPS[j];
        break;
      }
      j++;
    } 
    j--;

    let time_L=IMU_group_base.STPS[j];
    let tratio=(time_us-time_L)/(time_H-time_L);


    let ratio_data2stps=1.0*IMU_group_base[dataType_str].length/IMU_group_base.STPS.length;
    let dratio=tratio*ratio_data2stps;
    let DATA_L_IDX=Math.floor(tratio*ratio_data2stps);
    dratio-=DATA_L_IDX;



    gidx=GPMD.findRealGroupIdx(IMU_data,dataType_str,IMU_group_base_idx,DATA_L_IDX+1);
    let DATA_L=IMU_group_base[dataType_str][DATA_L_IDX];
    let DATA_H=IMU_data[gidx.group][dataType_str][gidx.idx];






    return {
      ratio:dratio,
      DL:DATA_L,
      DH:DATA_H,
      L:{
        group:IMU_group_base_idx,
        idx:DATA_L_IDX
      },
      H:gidx
    };
  },
  ProcessGYRO:(GYRO_data,Draw=false)=>{


    GYRO_ARR=[];
    yscal=100;
    interval=10;

    let euler = new THREE.Euler();

    let rotateInt = new THREE.Quaternion(0,0,0,1);

    let ori_quat=[];
    let counter=0;

    GYRO_data.forEach((GYRO_data_group,idx)=>{
      let SCAL=GYRO_data_group.SCAL;
      GYRO_data_group.rotate_quat=[];
      for(i=0;i<GYRO_data_group.GYRO.length;i+=3)
      {
        let delta_t_scale=GPMD.GetTimeDiff_us(GYRO_data,"GYRO",idx,i)*3/1000000;
        
        delta_t_scale/=SCAL;

        euler._x=GYRO_data_group.GYRO[i+0]*delta_t_scale;
        euler._y=GYRO_data_group.GYRO[i+1]*delta_t_scale;
        euler._z=GYRO_data_group.GYRO[i+2]*delta_t_scale;
        //ptr order is [0]=X [1]=Y [2]=Z

        let quat = new THREE.Quaternion();
        quat.setFromEuler(euler);


        GYRO_data_group.rotate_quat.push(quat);

        rotateInt.multiply(quat);
        if(counter%100==0)
        {

          GYRO_ARR.push(new THREE.Vector3(euler._x,euler._y,euler._z));
          let orien = new THREE.Quaternion();
          orien.copy(rotateInt);


          if(ifshowEuler)
          {


            let eulerX = new THREE.Euler();
            eulerX.setFromQuaternion(orien);
            ori_quat.push(eulerX);

          }
          else
          {
            ori_quat.push(orien);
          }
        }
        counter++;
      }

    });

    if(Draw)
      DrawVectorGraph(ori_quat,0,400,1030,30);

    //console.log(GYRO_data);
  },
  ProcessACCL:(ACCL_data,Draw=false)=>{
    let yscal=0.5;

    ACCL_ARR=[];
    ACCL_data.forEach((ACCL_data_group,idx)=>{
      let SCAL=ACCL_data_group.SCAL;
      ACCL_data_group.up_vec=[];
      if(typeof( ACCL_data_group.STPS) === 'undefined')
      {
        ACCL_data_group.STPS=[ACCL_data_group.TICK*1000];
      }
      for(i=0;i<ACCL_data_group.ACCL.length;i+=3)
      {
        let up = new THREE.Vector3((ACCL_data_group.ACCL[i+0]/SCAL+5.3), ACCL_data_group.ACCL[i+1]/SCAL, (ACCL_data_group.ACCL[i+2]/SCAL+5.3)) ;
        ACCL_data_group.up_vec.push(up);
        ACCL_ARR.push(up);
      }
    });

    if(Draw)
      DrawVectorGraph(ACCL_ARR,0,100,1000,2);

  },
  ProcessMAGN:(MAGN_data,Draw=false)=>{
    yscal=1
    MAGN_ARR=[];
    MAGN_data.forEach((MAGN_data_group,idx)=>{
      let SCAL=MAGN_data_group.SCAL;
      MAGN_data_group.north_vec=[];
      if(typeof( MAGN_data_group.STPS) === 'undefined')
      {
        MAGN_data_group.STPS=[MAGN_data_group.TICK*1000];
      }

      for(i=0;i<MAGN_data_group.MAGN.length;i+=3)
      {
        let x=MAGN_data_group.MAGN[i+1]/SCAL;
        let y=MAGN_data_group.MAGN[i+0]/SCAL;
        let z=MAGN_data_group.MAGN[i+2]/SCAL;


        let north = new THREE.Vector3(x,y,z);
        MAGN_data_group.north_vec.push(north);
        MAGN_ARR.push(north);
      }
      //console.log(euler)

    });

    if(Draw)
      DrawVectorGraph(MAGN_ARR,0,200,1000,2);
    //console.log(">>>>>>>>>>",GPMD.GetTimeDiff_us(ACCL_data,"EULER",ACCL_data.length-1,147));

  },
  ConvertUpNorthToQuaternion:(Up_vec,North_vec)=>{
    let East_vec=new THREE.Vector3();

    Up_vec.normalize();

    East_vec.copy(Up_vec);
    East_vec.cross(North_vec);
    East_vec.normalize();

    North_vec.copy(East_vec);
    North_vec.cross(Up_vec);
    //North_vec.normalize();


    var mat = new THREE.Matrix4();

    mat.set( 
     North_vec.x, North_vec.y, North_vec.z,0,
     East_vec.x , East_vec.y , East_vec.z ,0,
     Up_vec.x   , Up_vec.y   , Up_vec.z   ,0,
     0          , 0          , 0          ,1);

    var Quat = new THREE.Quaternion();
    Quat.setFromRotationMatrix(mat);
    
    return Quat;
  },
  FuseACCL_MAGN:(ACCL_data,MAGN_data,Draw=false)=>{
    let interp_Up=new THREE.Vector3();
    let interp_North=new THREE.Vector3();


    var FilteredQuat = new THREE.Quaternion();
    let loop_times=500;
    let dataArr=[];
    for(let i=0;i<loop_times;i++)
    {
      let time = i*(ACCL_data.length-1)*1000000/loop_times+ACCL_data[0].STPS[0];
      let fusion=new THREE.Vector3();
      let SS=GPMD.GetIDX_us(ACCL_data,"up_vec",time);
      interp_Up.copy(SS.DL);
      interp_Up.lerp ( SS.DH, SS.ratio);

      SS=GPMD.GetIDX_us(MAGN_data,"north_vec",time);
      /**/
      if(SS == null)
      {
        interp_North.copy(MAGN_data[0].north_vec[0]);
      }
      else
      {

        interp_North.copy(SS.DL);
        interp_North.lerp ( SS.DH, SS.ratio);
      }

      let quat=GPMD.ConvertUpNorthToQuaternion(interp_Up,interp_North);
      if(i==0)
      {
        FilteredQuat.copy(quat);
      }
      else
      {
        FilteredQuat.slerp(quat,0.5);
      }
      quat.copy(FilteredQuat);



      if(ifshowEuler)
      {
        let eulerX = new THREE.Euler();
        eulerX.setFromQuaternion(quat);
        dataArr.push(eulerX);
      }
      else
      {
        dataArr.push(quat);
      }
    }
    if(Draw)
      DrawVectorGraph(dataArr,0,600,1000,30);
    //console.log(dataArr);


  },
  //Front Camera Up      is [2]/Z axis,   Yaw ,heading
  //Front Camera left    is [1]/Y axis    Pitch,attitude
  //Front camera forward is [0]/X axis    Roll,bank
  extractIMUData:(gpmf_metadata)=>{
    console.log(gpmf_metadata);
    let GYRO_data = [];
    let ACCL_data = [];
    let MAGN_data = [];
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
    GPMD.ProcessGYRO(GYRO_data,true);
    GPMD.ProcessACCL(ACCL_data,true);
    GPMD.ProcessMAGN(MAGN_data,true);
    GPMD.FuseACCL_MAGN(ACCL_data,MAGN_data,true);
  }

}


let UTILITY={
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
    let xhr = new XMLHttpRequest();
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
          let obj=JSON.parse(txt);
          promise.resolve(obj);
      },
      reject:promise.reject
    });
  },
  ajax_fix_gpmf2json:(METHOD,URL,promise)=>{

    UTILITY.fetch_txt(METHOD,URL,{
      resolve:(txt)=>{
          let obj=JSON.parse(UTILITY.fix(txt));
          promise.resolve(obj);
      },
      reject:promise.reject
    });
  }



}
