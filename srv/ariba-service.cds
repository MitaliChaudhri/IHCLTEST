//importing cds schema
using {ihcl_bid_eval.db as my} from '../db/schema';

//declaring service
service AribaService {
    action getWorkSpaceInfo() returns String;
    entity ContractedData as projection on my.T_LastYearContractRate;

}
