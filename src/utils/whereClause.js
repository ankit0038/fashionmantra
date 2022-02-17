

// base - product.find()

/*
 * this utility class will be used to parse search query passed in URL
 * the this search query will be converted to a filter which we will pass in
 * to the DB as a where clause
 */
 

class WhereClause {
        constructor(base, bigQ) {
                this.base = base;
                this.bigQ = bigQ;
        }

        search() {
                const searchWord = this.bigQ.search ? {
                        name: {
                                $regex: this.bigQ.search,
                                $options: 'i'
                        }
                } : {};

                this.base = this.base.find({...searchWord});
                return this;
        }

        filter() {
                const copyQ = {...this.bigQ};

                delete copyQ["search"];
                delete copyQ["limit"];
                delete copyQ["page"];

                //convert copyQ to string
                let stringCopyQ = JSON.stringify(copyQ);

                // replace all occurences of 'gte', 'lte', 'gt', 'lt' with '$gte', '$lte', '$gt', '$lt' to make valid mongoDB query
                stringCopyQ = stringCopyQ.replace(/\b(gte | lte | gt | lt)\b/g, m => `$${m}`);

                const jsonCopyQ = JSON.parse(stringCopyQ);

                this.base = this.base.find(jsonCopyQ);
                return this;
        }

        pager(recordPerPage) {
                
                let currentPage = this.bigQ.page || 1;

                const skipRecord = recordPerPage * (currentPage - 1);
                this.base = this.base.limit(recordPerPage).skip(skipRecord);

                return this;
        }
}

module.exports = WhereClause;