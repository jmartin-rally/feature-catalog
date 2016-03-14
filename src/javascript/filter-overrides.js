Ext.override(Rally.ui.gridboard.GridBoard,{

    // change so that filters in store can be applied at the associated level
    // NOTE:  does not deal with multiple types
    _applyGridFilters: function(grid, filterObj) {
        var filter = {};
        var type = Ext.util.Format.lowercase(filterObj.types[0]);
        filter[type] = filterObj.filters;
        
        var filters_by_type_path = Ext.Object.merge(grid.store.filtersByPath, filter);
        grid.store.filtersByPath = filters_by_type_path;
        
        var parentTypes = grid.store.parentTypes;
        grid.store.clearFilter(true);
        
        if ( Ext.Array.contains(parentTypes, type) ) {
            grid.store.filter(this._getConfiguredFilters(filterObj.filters || [], filterObj.types || []));
            return;
        }
                
        grid.store.filter(this._getConfiguredFilters(filters_by_type_path[parentTypes[0]] || [], parentTypes || []));

    }
});

Ext.override(Rally.data.wsapi.TreeStore, {
    filtersByPath: {},
    
    _getChildNodeFilters: function(node) {
        var parentType = node.self.typePath,
            childTypes = this._getChildTypePaths([parentType]),
            parentFieldNames = this._getParentFieldNames(childTypes, parentType);

        if (parentFieldNames.length) {
            var filters = Rally.data.wsapi.Filter.or(_.map(parentFieldNames, function(parentFieldName) {
                return {
                    property: parentFieldName,
                    operator: '=',
                    value: node.get('_ref')
                };
            }));
            
            if ( childTypes.length ) {
                var extraFilters = this.filtersByPath[childTypes[0]];
                if ( extraFilters && extraFilters.length > 0 ) {
                    filters = filters.and(
                        Rally.data.wsapi.Filter.and(extraFilters)
                    );
                }
            }
            
            return [filters];
        }

        return [];
    }
});
