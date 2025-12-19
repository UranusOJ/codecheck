import {
    _, db, UserModel, SettingModel, DomainModel, Handler, param, PRIV, Types, query, NotFoundError,
    RecordDoc,
    User,
    PERM
} from 'hydrooj';

interface mypair{
    a:RecordDoc;
    b:RecordDoc;
    d:number;
    ua:User;
    ub:User;
};

const coll = db.collection('record');
declare module 'hydrooj' {
    interface Model {
        ccer: typeof ccer;
    }
}
async function getCode(domainId:string,pid:number):Promise<RecordDoc[]>{
    // 此处只比代码正确的相似度
    return coll.find({domainId:domainId,status:1,pid:pid}).toArray();
}
// 检查代码相似度（主要是要做一遍编辑距离问题）
async function getSimilar(a:string,b:string){
    let la = a.length;
    let lb = b.length;
    
    let f:number[][] = [new Array(lb+1).fill(0),new Array(lb+1).fill(0)];
    
    for(let i:number = 0;i <= la;i++){
        for(let j:number = 0;j <= lb;j++){
            if(i === 0){
                f[1][j] = j;
            } else if(j === 0){
                f[1][j] = i;
            } else{
                let x:number = 0;
                if(a[i-1] !== b[j-1]){
                    x = 1;
                }
                f[1][j] = Math.min(f[0][j]+1,f[1][j-1]+1,f[0][j-1]+x);
            }
        }
        for(let j:number = 0;j <= lb;j++){
            f[0][j] = f[1][j];
        }
    }
    return 1-(f[0][lb]/Math.max(la,lb));
}
// Code Checker
const ccer = {getCode,getSimilar};
global.Hydro.model.ccer = ccer;

class CodeCheckHandler extends Handler {
    @param('pid', Types.ProblemId)
    async get(domainId:string,pid:number){
        let codes = await getCode(domainId,pid);
        let com:mypair[] = [];
        for(let i:number = 0;i < codes.length;i++){
            for(let j:number = i+1;j < codes.length;j++){
                // 不和自己比较相似度
                if(codes[i].uid !== codes[j].uid){
                    let a = codes[i];
                    let b = codes[j];
                    let d:number = await getSimilar(a.code,b.code);
                    let ua:User = await UserModel.getById(domainId,a.uid);
                    let ub:User = await UserModel.getById(domainId,b.uid);
                    com.push({a:a,b:b,d:d,ua:ua,ub:ub});
                }
            }
        }
        com.sort((a,b)=>{
            return b.d-a.d;
        });
        this.response.body = {com};
        this.response.template = 'code_check.html'; // 返回此页面
    }
}
export async function apply(ctx:Context){
    ctx.Route('code_check','/code-check/:pid',CodeCheckHandler,PERM.PERM_CREATE_PROBLEM);
}