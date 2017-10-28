
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

    while(idx<0)
    {
      if(group==0)return null;
      group--;
      idx+=IMU_data[group][dataType_str].length;
    }

    let IMU_group_base=IMU_data[group];

    while(idx>=IMU_group_base[dataType_str].length)
    {
      idx-=IMU_group_base[dataType_str].length;

      if(group==IMU_data.length-1)return null;
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


    let STP_H;
    gidx=GPMD.findRealGroupIdx(IMU_data,"STPS",group,STP_L_IDX+1);
    if(gidx==null)
    {//No next STPS data to use, find previous STPS and estimate it
      let pre_idx=GPMD.findRealGroupIdx(IMU_data,"STPS",group,STP_L_IDX-1);

      let STP_pre=IMU_data[pre_idx.group].STPS[pre_idx.idx];

      STP_H = STP_L + (STP_L - STP_pre);
      return null;
    }
    else
    {
      STP_H=IMU_data[gidx.group].STPS[gidx.idx];
    }



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



    let gtime_H=0;
    let gtime_L=0;

    for(i=start_group;i<IMU_data.length;)
    { 
      if(IMU_data[i].STPS[0]>time_us)
      {
        gtime_H=IMU_data[i].STPS[0];
        i--;
        break;
      }
      i++;
    }

    if(i<0 || i>=IMU_data.length)
    {
      return null;
    }
    gtime_L=IMU_data[i].STPS[0];

    let IMU_group_base_idx=i;
    let IMU_group_base=IMU_data[i];


    for(j=start_index;j<IMU_group_base.STPS.length;)
    {
      if(IMU_group_base.STPS[j]>time_us)
      {
        break;
      }
      j++;
    } 
    j--;

    let tratio=(time_us-gtime_L)/(gtime_H-gtime_L);

    let dratio=tratio*IMU_group_base[dataType_str].length;
    let DATA_L_IDX=Math.floor(dratio);
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

  ProcessCALB:(CALB_data)=>{
    CALB_data.ACLB=new THREE.Vector3(CALB_data.ACLB[0],CALB_data.ACLB[1],CALB_data.ACLB[2]);
    if(CALB_data.ACLB.x==0&&CALB_data.ACLB.y==0,CALB_data.ACLB.z==0)
    {
      CALB_data.ACLB.x=-5.3;
      CALB_data.ACLB.z=-5.3;
    }
    CALB_data.ACLS=new THREE.Vector3(CALB_data.ACLS[0],CALB_data.ACLS[1],CALB_data.ACLS[2]);
    CALB_data.GYRB=new THREE.Vector3(CALB_data.GYRB[0],CALB_data.GYRB[1],CALB_data.GYRB[2]);
    CALB_data.ORNT=new THREE.Quaternion(CALB_data.ORNT[0],CALB_data.ORNT[1],CALB_data.ORNT[2],CALB_data.ORNT[3]);


    console.log(CALB_data);
  },
  ProcessGYRO:(GYRO_data,CALB_data,Draw=false)=>{
    let euler = new THREE.Euler();

    GYRO_data.forEach((GYRO_data_group,idx)=>{
      let SCAL=GYRO_data_group.SCAL;
      GYRO_data_group.rotate_quat=[];
      for(i=0;i<GYRO_data_group.GYRO.length;i+=3)
      {
        let delta_t_scale=GPMD.GetTimeDiff_us(GYRO_data,"GYRO",idx,i)*3/1000000;
      

        euler._x=(GYRO_data_group.GYRO[i+0]/SCAL-CALB_data.GYRB.x)*delta_t_scale;
        euler._y=(GYRO_data_group.GYRO[i+1]/SCAL-CALB_data.GYRB.y)*delta_t_scale;
        euler._z=(GYRO_data_group.GYRO[i+2]/SCAL-CALB_data.GYRB.z)*delta_t_scale;
        //ptr order is [0]=X [1]=Y [2]=Z

        let quat = new THREE.Quaternion();
        quat.setFromEuler(euler);

        GYRO_data_group.rotate_quat.push(quat);
      }

    });

    if(Draw)
    {
      let ori_quat=[];
      let rotateInt = new THREE.Quaternion(0,0,0,1);
      let Counter=0;
      GYRO_data.forEach((GYRO_data_group,idx)=>{
        GYRO_data_group.rotate_quat.forEach((rotate_quat)=>{
          rotateInt.multiply(rotate_quat);


          let tmp_quat = new THREE.Quaternion();
          tmp_quat.copy(rotateInt);

          if((Counter++)&100==0)return;
          if(ifshowEuler)
          {


            let eulerX = new THREE.Euler();
            eulerX.setFromQuaternion(tmp_quat);
            ori_quat.push(eulerX);

          }
          else
          {
            ori_quat.push(tmp_quat);
          }

        });
      });
      DrawVectorGraph(ori_quat,0,400,1000,30);
    }

    //console.log(GYRO_data);
  },
  ProcessACCL:(ACCL_data,CALB_data,Draw=false)=>{
    let yscal=0.5;
    let filteredUp=new THREE.Vector3();

    ACCL_data.forEach((ACCL_data_group,idx)=>{
      let SCAL=ACCL_data_group.SCAL;
      ACCL_data_group.up_vec=[];
      if(typeof( ACCL_data_group.STPS) === 'undefined')
      {
        ACCL_data_group.STPS=[ACCL_data_group.TICK*1000];
      }
      for(i=0;i<ACCL_data_group.ACCL.length;i+=3)
      {
        let up = new THREE.Vector3((ACCL_data_group.ACCL[i+0]/SCAL-CALB_data.ACLB.x), (ACCL_data_group.ACCL[i+1]/SCAL-CALB_data.ACLB.y), (ACCL_data_group.ACCL[i+2]/SCAL-CALB_data.ACLB.z)) ;
        if(idx==0 && i==0)
        {
          filteredUp.copy(up);
        }
        else
        {
          filteredUp.lerp(up,0.1);
        }
        up.copy(filteredUp);

        ACCL_data_group.up_vec.push(up);
      }
    });

    if(Draw)
    {
      ACCL_ARR=[];
      ACCL_data.forEach((ACCL_data_group,idx)=>{
        ACCL_data_group.up_vec.forEach((up_vec)=>{
          ACCL_ARR.push(up_vec);
        });
      });
      DrawVectorGraph(ACCL_ARR,0,100,1000,2);
    }

  },
  ProcessMAGN:(MAGN_data,CALB_data,Draw=false)=>{

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
      }
      //console.log(euler)

    });

    if(Draw)
    {
      MAGN_ARR=[];
      MAGN_data.forEach((MAGN_data_group,idx)=>{
        MAGN_data_group.north_vec.forEach((north_vec)=>{
          MAGN_ARR.push(north_vec);
        });
      });
      DrawVectorGraph(MAGN_ARR,0,200,1000,2);
    }
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


    var FilteredQuat = null;


    ACCL_data.forEach((ACCL_data_group,g_idx)=>{
      ACCL_data_group.fuse_ACCL_MAGN_quat=[];
      for(a_idx=0;a_idx<ACCL_data_group.up_vec.length;a_idx++)
      {
        let interp_Up = ACCL_data_group.up_vec[a_idx];
        let time_us=GPMD.GetDataTimePoint_us(ACCL_data,'up_vec',g_idx,a_idx);

        let SS=GPMD.GetIDX_us(MAGN_data,"north_vec",time_us);
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
        if(FilteredQuat==null)
        {
          FilteredQuat=new THREE.Quaternion();
          FilteredQuat.copy(quat);
        }
        else
        {
          FilteredQuat.slerp(quat,1);
        }
        quat.copy(FilteredQuat);
        ACCL_data_group.fuse_ACCL_MAGN_quat.push(quat);

      }

    });

    if(Draw){
      FUSE_ARR=[];
      ACCL_data.forEach((ACCL_data_group,g_idx)=>{
        ACCL_data_group.fuse_ACCL_MAGN_quat.forEach((quat)=>{
          if(ifshowEuler)
          {
            let eulerX = new THREE.Euler();
            eulerX.setFromQuaternion(quat);
            FUSE_ARR.push(eulerX);
          }
          else
          {
            FUSE_ARR.push(quat);
          }
        });
      });
      DrawVectorGraph(FUSE_ARR,0,600,1000,30);
    }
    //console.log(dataArr);
  },
  FuseGYRO_ACCL_MAGN:(GYRO_data,ACCL_data,MAGN_data,CALB_data,Draw=false)=>{

    GPMD.ProcessGYRO(GYRO_data,CALB_data,Draw);
    GPMD.ProcessACCL(ACCL_data,CALB_data,Draw);
    GPMD.ProcessMAGN(MAGN_data,CALB_data,Draw);
    GPMD.FuseACCL_MAGN(ACCL_data,MAGN_data,Draw);
    let rotateInt = new THREE.Quaternion(0,0,0,1);
    //rotateInt.copy(ACCL_data[0].fuse_ACCL_MAGN_quat[0]);
    //rotateInt.copy(CALB_data.ORNT);


    let Counter=0;
    GYRO_data.forEach((GYRO_data_group,g_idx)=>{
      GYRO_data_group.orientation_quat=[];
      GYRO_data_group.rotate_quat.forEach((rotate_quat,a_idx)=>{

        let time_us=GPMD.GetDataTimePoint_us(GYRO_data,'rotate_quat',g_idx,a_idx);

        rotateInt.multiply(rotate_quat);
        Counter++;


        if(Counter%16==0)
        {
          let tmpQuat = new THREE.Quaternion();
          let SS=GPMD.GetIDX_us(ACCL_data,"fuse_ACCL_MAGN_quat",time_us);

          if(SS!=null)
          {
            tmpQuat.copy(SS.DL);
            tmpQuat.slerp(SS.DH, SS.ratio);

            rotateInt.slerp(tmpQuat,0.0001);
          }
          tmpQuat.copy(rotateInt);
          GYRO_data_group.orientation_quat.push(tmpQuat);
        }
      });
    });
    if(Draw)
    {
      console.log(GYRO_data);

      let ori_quat=[];
      for(i=000;;i++)
      {
        let time_us=i*30000+GYRO_data[0].STPS[0];
        let SS=GPMD.GetIDX_us(GYRO_data,"orientation_quat",time_us);
        if(SS==null)
        {
          break;
        }
          //console.log(SS);
        let eulerX = new THREE.Euler();
        eulerX.setFromQuaternion(SS.DL);
        ori_quat.push(eulerX);

      }
      DrawVectorGraph(ori_quat,0,800,1000,30);
    }

  },
  //Front Camera Up      is [2]/Z axis,   Yaw ,heading
  //Front Camera left    is [1]/Y axis    Pitch,attitude
  //Front camera forward is [0]/X axis    Roll,bank
  extractIMUData:(gpmf_metadata)=>{
    let GYRO_data = [];
    let ACCL_data = [];
    let MAGN_data = [];
    let CALB_data ={};
    gpmf_metadata.DEVCs.forEach((DEVC)=>{
      if(DEVC.DVID=="IMUC")
      {
        CALB_data=DEVC.STRMs[0];
        return;
      }

      DEVC.STRMs.forEach((STRM)=>{
        if(typeof( STRM.GYRO) != 'undefined')
          GYRO_data.push(STRM);
        else if(typeof( STRM.ACCL) != 'undefined')
          ACCL_data.push(STRM);
        else if(typeof( STRM.MAGN) != 'undefined')
          MAGN_data.push(STRM);
      });
    });
    let DrawG=false;
    GPMD.ProcessCALB(CALB_data);
    GPMD.FuseGYRO_ACCL_MAGN(GYRO_data,ACCL_data,MAGN_data,CALB_data,DrawG);
    return GYRO_data;
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
