app = angular.module("TableConstructor", []);

app.factory("TableConstructorItems", ['$rootScope', function($rootScope){
  
  var confirmDelete = function(item){
    $rootScope.$broadcast('confirmDelete', item);
  };
  
  return {
    confirmDelete: confirmDelete
  };
  
}]);

app.controller("TableConstructorCtrl", ['$scope', '$http', '$location', function($scope, $http, $location){
  
  $scope.page = 1;
  
  $scope.loadItems = function(page, pageClicked, itemsPerPage, search) { 
    params = (page) ? "?page=" +page+ ((itemsPerPage) ? "&itemsPerPage=" +itemsPerPage : "") : "";
    params += (params) ? "&" + ((search) ? "search=" +search : "") : "?";
        
    $http.get("/" +$scope.url+ params)
         .success(function(data){
           if(pageClicked){
             if(data.length > 0){
               $scope.items = data;
             } else {
               $scope.page -= 1;
             }
           } else {
             $scope.items = data;
           }
         })
         .error(function(){
           alert("Ocorreu um erro ao carregar a tabela");
         });
  };
       
  $scope.deleteItem = function(item) {
    parent = $scope.$parent;
    retorno = parent[$scope.deleteFunction](item);
    $scope.deletedItem = item;
  };
  
  
  $scope.$on('confirmDelete', function(event, item) {
    $scope.items.splice($scope.items.lastIndexOf(item), 1);
  });
    
  
  $scope.showItem = function(item, page, itemsPerPage){
    $location.path($scope.urlEdit+ "/" +item);
  };
  
  $scope.nextPage = function(){
    $scope.page += 1;
    $scope.loadItems($scope.page, true, $scope.itemsPerPage);
  };
  
  $scope.previousPage = function(){
    if($scope.page > 1) {
      $scope.page -= 1;
      $scope.loadItems($scope.page, true, $scope.itemsPerPage);
    }
  };
   
}]);

app.directive("tableConstructor", function(){
  return {
    restrict: "E",
    templateUrl: "templates/table_constructor_template.html",
    controller: "TableConstructorCtrl",
    scope: {
      url: "=",
      fields: "=",
      deleteFunction: "=",
      urlEdit: "=",
      fieldLoadEdit: "=",
      tableClass: "=",
      enablePaginator: "=",
      itemsPerPage: "=",
      searchField: "=",
      buttonDeleteClass: "=",
      buttonEditClass: "=",
      buttonEditContentText: "=",
      buttonEditContentClass: "=",
      buttonDeleteContentText: "=",
      buttonDeleteContentClass: "=",
    },
    link: function(scope, element, attrs){
      scope.$watch('searchField', function(newValue, oldValue){
        scope.searchValue = newValue;
        scope.loadItems(1, false, scope.itemsPerPage, scope.searchValue);
      });
    }
  };
});

app.directive("tableConstructorColumn", function(){
  return {
    restrict: "E",
    scope: {
      field: "=",
      item: "="
    },
    link: function(scope, element, attrs) {
      
      displayText = "";
      
      if(scope.field.filter != undefined && typeof scope.field.filter === 'function') {
        displayText = scope.field.filter(scope.item[scope.field.column]);
      } else {
        displayText = scope.item[scope.field.column];
      }
      
      if(scope.field.conditionToDisplay != undefined) {
        displayText = scope.field.conditionToDisplay(scope.item[scope.field.column]) ? (scope.field.template == undefined || scope.field.template == "" ? displayText : scope.field.template ) : "";
      } else {
        displayText = scope.field.template == undefined || scope.field.template == "" ? displayText : scope.field.template;        
      }
      
      element.replaceWith(displayText);
      
    }
  };
});
