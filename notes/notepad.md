<div className="flex flex-col space-y-2 p-4">
      <div className="flex items-center space-x-1">
        <label className="flex flex-col text-sm font-semibold text-gray-400">
          On Date
          <input
            type="date"
            className="border rounded text-sm"
            aria-label="start-date"
            value={pre.onDate || ""}
            onChange={(e) => {
              pre.onDate = e.target.value;
              setRefresh({});
            }}
          />
        </label>
        <label className="flex flex-col text-sm font-semibold text-gray-400">
          Age
          <Select
            options={ageOptions}
            value={pre.ageFilterOption.selectedAge}
            // onChange={handleOnChangeAge}F
            placeholder="Select Age Range"
            className="w-30"
            styles={Utils.getReactSelectStyles()}
          />
        </label>
        <label className="flex flex-col text-sm font-semibold text-gray-400 flex-1">
          Gross Profit
          <Select
            options={ageOptions}
            value={pre.ageFilterOption.selectedAge}
            // onChange={handleOnChangeAge}F
            placeholder="Select gross profit"
            className="w-full"
            styles={Utils.getReactSelectStyles()}
          />
        </label>
      </div>
      {/* Categories group */}
      <div className="space-y-4 w-full">
        {/* Categories */}
        <label className="text-sm font-semibold text-gray-400">
          Categories
        </label>
        <DropDownTreeComponent
          className="h-10"
          id="dropDowntree"
          ref={catRef}
          showClearButton={false}
          placeholder="Select a category ..."
          fields={fields}
          allowMultiSelection={false}
          popupHeight="300px"
          allowFiltering={true}
          filterBarPlaceholder="Search"
          // select={handleOnChangeCategory}
          created={() => {
            if (catRef.current) {
              setCategory();
            }
          }}
        />

        {/* Brands */}
        <div className="flex items-center space-x-2 w-full">
          <label className="text-sm font-semibold text-gray-400">
            Brands
            <Select
            className="flex flex-1 w-1/2"
              getOptionLabel={(option: BrandType) => option.brandName}
              getOptionValue={(option: BrandType) => option.id as any}
              options={brandOptions}
              styles={Utils.getReactSelectStyles()}
              value={pre.catFilterOption.selectedBrand}
              // onChange={handleOnChangeBrand}
              placeholder="Select a brand..."
            />
          </label>

          {/* Tags */}
          <label className="text-sm font-semibold text-gray-400">
            Tags
            <Select
            className="flex flex-1 w-1/2"
              getOptionLabel={(option: TagType) => option.tagName}
              getOptionValue={(option: TagType) => option.id as any}
              options={tagOptions}
              styles={Utils.getReactSelectStyles()}
              value={pre.catFilterOption.selectedTag}
              // onChange={handleOnChangeTag}
              placeholder="Select a tag..."
            />
          </label>
        </div>
      </div>
    </div>