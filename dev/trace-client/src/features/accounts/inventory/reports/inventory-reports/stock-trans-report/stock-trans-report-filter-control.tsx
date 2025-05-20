import { useDispatch, useSelector } from "react-redux";
import { AppDispatchType, RootStateType } from "../../../../../../app/store/store";
import { useEffect, useRef, useState } from "react";
import { useUtilsInfo } from "../../../../../../utils/utils-info-hook";
import { DropDownTreeComponent, FieldsModel } from "@syncfusion/ej2-react-dropdowns";
import { BrandType, CategoryNodeType, TagType } from "../../../shared-definitions";
import { StockTransReportInitialStateType } from "./stock-trans-report-slice";
import _ from 'lodash'
import { Utils } from "../../../../../../utils/utils";
import { SqlIdsMap } from "../../../../../../app/graphql/maps/sql-ids-map";

export function StockTransReportFilterControl() {
    const dispatch: AppDispatchType = useDispatch();
  const [, setRefresh] = useState({});
  const selectedFilters = useSelector(
    (state: RootStateType) => state.stockTransReport
  );
  const { buCode, dbName, decodedDbParamsObject } = useUtilsInfo();
  const catRef = useRef<DropDownTreeComponent | null>(null);
  const [brandOptions, setBrandOptions] = useState<BrandType[]>([]);
  const [tagOptions, setTagOptions] = useState<TagType[]>([]);
  const [catOptions, setCatOptions] = useState<CategoryNodeType[]>([]);

  const meta = useRef<MetaType>({
    filterMode:selectedFilters.filterMode,
      catFilterOption: {
        selectedBrand: selectedFilters.catFilterOption.selectedBrand,
        selectedCategory: selectedFilters.catFilterOption.selectedCategory,
        selectedTag: selectedFilters.catFilterOption.selectedTag,
      },
      productCode: selectedFilters.productCode
    });
    const pre = meta.current;

    const fields: FieldsModel = {
        dataSource: catOptions as any,
        value: "id",
        parentValue: "parentId",
        text: "catName",
        hasChildren: "hasChild",
      };

      useEffect(() => {
          if (
            _.isEmpty(brandOptions) &&
            _.isEmpty(tagOptions) &&
            _.isEmpty(catOptions)
          ) {
            loadAllOptions();
            return;
          }
          if (_.isEmpty(pre.catFilterOption.selectedBrand)) {
            pre.catFilterOption.selectedBrand = brandOptions[0];
          }
          if (_.isEmpty(pre.catFilterOption.selectedTag)) {
            pre.catFilterOption.selectedTag = tagOptions[0];
          }
          
      
          setRefresh({}); // Trigger a re-render
        }, [brandOptions, tagOptions]);



        async function loadAllOptions() {
            try {
              const res = await Utils.doGenericQuery({
                buCode: buCode || "",
                dbName: dbName || "",
                dbParams: decodedDbParamsObject,
                sqlId: SqlIdsMap.getBrandsCategoriesTags,
              });
              const jsonResult: JsonResultType = res?.[0]?.jsonResult;
              if (jsonResult) {
                const brands = jsonResult.brands || [];
                brands.unshift({ brandName: "All", id: null });
                setBrandOptions(brands);
        
                const tags = jsonResult.tags || [];
                tags.unshift({ tagName: "All", id: null });
                setTagOptions(tags);
        
                const cats = jsonResult.categories || [];
                cats.unshift({
                  catName: "All",
                  id: "",
                  isLeaf: true,
                  parentId: null,
                });
                cats.forEach((cat: CategoryNodeType) => {
                  cat.hasChild = !cat.isLeaf;
                });
                setCatOptions(cats);
              }
            } catch (e: any) {
              console.log(e);
            }
          }
}

type JsonResultType = {
  brands: BrandType[];
  categories: CategoryNodeType[];
  tags: TagType[];
};

type MetaType = StockTransReportInitialStateType;