//schema namespace
namespace ihcl_bid_eval.db;

//importing common aspects
using {
    cuid,
    managed
} from '@sap/cds/common';

//adding isdel into managed aspect
extend managed with {
    isdel : Boolean default false;
};

entity T_WorkSpace : cuid, managed {
    ID         : UUID;
    InternalId : String(20); //WorkSpace Id
    WSTitle    : String(100);
    Status     : String(20);
    Region     : String(20);
}

entity T_LastYearContractRate : cuid, managed {
    key ID                      : UUID;
        LYCRID                  : Integer; //Last year contracted rate ID this will be auto-increment key
        Region                  : String(20);
        Unit                    : String(100);
        Category                : String(100);
        Item                    : String(100);
        UOM                     : String(20);
        ItemCode                : String(20);
        Qty                     : String(10);
        Year                    : String(10);
        LastYearContractedRate  : Decimal(15, 2);
        WeightedContractedValue : Decimal(15, 2);
        AnnualAvgRate           : Decimal(15, 2);
        WeightedAvgValue        : Decimal(15, 2);
        LastYear                : String(10);
}

