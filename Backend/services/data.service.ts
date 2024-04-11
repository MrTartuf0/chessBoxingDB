import Db from "../helpers/db.ts";

class DataService {
    private db: Db;

    constructor(client) {
        this.db = client;
    }

public async fetchData<T>(
    collectionName: string,
    params: any,
) {
    try {
        const db = await this.db.getDb();
        const collection = db.collection<T>(collectionName);

        let start = 0;
        let end = params.limit;
        var sortOptions = {};
        sortOptions[params.orderBy] = params.order === "asc" ? 1 : -1;
        const searchQuery: any = {};

        if (params.search) {
            const searchParams = params.search.split(';');
            for (const param of searchParams) {
                const [field, value] = param.split(':');
                searchQuery[field] = value;
            }
        }

        console.log(searchQuery);
        var data = await collection.find(searchQuery).limit(params.limit).sort(sortOptions).toArray();
        var additionalData:any = {};
        if(params.page) {
            start = 50 * params.page;
            end = start + 50;
            var len = data.length;
            data = data.slice(start, end);
            additionalData = {current: params.page, total: Math.ceil(len / 50)-1};

        }


        if (data.length > 0) {
            return {
                status: "success",
                message: "Results found",
                paging: additionalData,
                code: 200,
                payload: data
            };
        } else {
            return {
                status: "error",
                message: "Results not found",
                code: 404,
                payload: null
            };
        }
    } catch (error) {
        console.error("Error fetching results:", error);
        return {
            status: "error",
            message: "Internal server error",
            code: 500,
            payload: null
        };
    }
}


}




export default DataService;
