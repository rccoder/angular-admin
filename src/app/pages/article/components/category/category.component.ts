/**
 * @file 分类页面组件
 * @module app/page/article/component/category
 * @author Surmon <https://github.com/surmon-china>
 */

import * as lodash from 'lodash';
import * as API_PATH from '@app/constants/api';
import { ModalDirective } from 'ngx-bootstrap';
import { Component, ViewChild, OnInit } from '@angular/core';
import { SaHttpRequesterService } from '@app/services';
import { TApiPath, IFetching, TSelectedIds } from '@app/pages/pages.constants';
import { ICategory, TResponsePaginationCategory, buildLevelCategories } from '@/app/pages/article/article.service';

@Component({
  selector: 'page-article-category',
  template: require('./category.html'),
})
export class ArticleCategoryComponent implements OnInit {

  @ViewChild('delModal') delModal: ModalDirective;
  @ViewChild('editCategoryForm') editCategoryForm;

  private apiPath: TApiPath = API_PATH.CATEGORY;

  public categories: TResponsePaginationCategory = {
    data: []
  };
  public fetching: IFetching = {
    get: false,
    post: false
  };
  public todoDelCategory: ICategory;
  public todoEditCategory: ICategory;
  public todoDelCategories: TSelectedIds;

  constructor(private httpService: SaHttpRequesterService) {}

  ngOnInit() {
    this.getCategories();
  }

  // 重置编辑数据
  public resetEditForm() {
    this.todoEditCategory = null;
    this.editCategoryForm.resetEditForm();
  }

  // 修改分类
  public editCategory(category: ICategory) {
    this.todoEditCategory = lodash.cloneDeep(category);
  }

  // 删除分类弹窗
  public delCategory(category: ICategory) {
    this.todoDelCategory = lodash.cloneDeep(category);
    this.delModal.show();
  }

  // 分类弹窗取消
  public canceldDelCategory() {
    this.todoDelCategory = null;
    this.delModal.hide();
  }

  // 批量删除分类
  public delCategories(categories: TSelectedIds) {
    this.todoDelCategories = categories;
    this.todoDelCategory = null;
    this.delModal.show();
  }

  // 添加或更新的相应处理
  public handlePostRequest(request: Promise<any>) {
    request.then(_ => {
      this.getCategories();
      this.resetEditForm();
      this.fetching.post = false;
    }).catch(_ => {
      this.fetching.post = false;
    });
  }

  // 获取分类
  public getCategories() {
    this.fetching.get = true;
    this.httpService.get<TResponsePaginationCategory>(this.apiPath, { per_page: 100 })
    .then(categories => {
      this.categories = categories.result;
      this.fetching.get = false;
      this.categories.data = buildLevelCategories(this.categories.data);
    })
    .catch(_ => {
      this.fetching.get = false;
    });
  }

  // 添加分类
  public addCategory(category: ICategory) {
    this.fetching.post = true;
    const request = this.httpService.post(this.apiPath, category);
    this.handlePostRequest(request);
  }

  // 修改分类
  public doEditCategory(category: ICategory) {
    this.fetching.post = true;
    const newCategory = Object.assign(this.todoEditCategory, category);
    const request = this.httpService.put(`${ this.apiPath }/${ newCategory._id }`, newCategory);
    this.handlePostRequest(request);
  }

  // 删除分类
  public doDelCategory() {
    this.httpService.delete(`${ this.apiPath }/${ this.todoDelCategory._id }`)
    .then(_ => {
      this.todoDelCategory = null;
      this.delModal.hide();
      this.getCategories();
    })
    .catch(_ => {
      this.delModal.hide();
    });
  }

  // 批量删除
  public doDelCategories() {
    this.httpService.delete(this.apiPath, { categorie_ids: this.todoDelCategories })
    .then(_ => {
      this.todoDelCategories = null;
      this.delModal.hide();
      this.getCategories();
    })
    .catch(_ => {
      this.delModal.hide();
    });
  }
}
