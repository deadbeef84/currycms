<?php
/**
 * Created by PhpStorm.
 * User: jesper
 * Date: 2015-05-18
 * Time: 11:37
 */

namespace Curry\Backend;


use Symfony\Component\HttpFoundation\Request;

class Files extends AbstractBackend {
    public function show(Request $request)
    {
        /*$this->addMainContent(<<<HTML
<div class="finder">
  <div class="finder-content">
    <ul class="finder-list">
      <li class="finder-entry finder-entry-folder finder-entry-selected finder-entry-highlighted">
        <a href="#" class=""><span class="{{file.Icon}}"></span>file.txt</a>
      </li>
      <li class="finder-entry finder-entry-file">
        <a href="#" class=""><span class="{{file.Icon}}"></span>file.txt</a>
      </li>
    </ul><!--
 --><ul class="finder-info">
      <li class="finder-info-property">value</li>
    </ul>
  </div>
  <div class="finder-actions">
    <span class="finder-buttons">
      <button class="finder-button finder-action-name">Download</button>
    </span>
    <input type="search" placeholder="Search...">
    <select class="finder-filter">
      <option>All files</option>
    </select>
    <span class="finder-buttons">
      <button class="finder-button finder-cancel">Cancel</button>
      <button class="finder-button finder-confirm">Select</button>
    </span>
  </div>
  <div class="finder-overlay">Loading...</div>
</div>
HTML
        );*/
        $this->addMainContent(<<<HTML
<div class="finder"></div>
HTML
);

        return parent::render();
    }
}