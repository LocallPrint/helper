#!/bin/sh
#
# This assumes all of the OS-level configuration has been completed and git repo has already been cloned
#
# This script should be run from the repo's deployment directory
# cd deployment
# ./build-s3-dist.sh source-bucket-base-name trademarked-solution-name version-code

# Get reference for all important folders
build_dir="$PWD"
build_dist_dir="$build_dir/regional-s3-assets"
source_dir="$build_dir/../source"

echo "------------------------------------------------------------------------------"
echo "[Init] Clean old dist folders"
echo "------------------------------------------------------------------------------"
echo "rm -rf $build_dist_dir"
rm -rf $build_dist_dir
echo "mkdir -p $build_dist_dir"
mkdir -p $build_dist_dir

echo "------------------------------------------------------------------------------"
echo "[Rebuild] Resource - Custom Helper"
echo "------------------------------------------------------------------------------"
cd $source_dir/helper
npm run build
cp ./dist/helper.zip $build_dist_dir/helper.zip
